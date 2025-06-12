import { supabase } from "./supabase"
import type { DSAEntry } from "@/app/page"

// Get all entries (only those with actual questions solved)
export async function getEntries(): Promise<Record<string, DSAEntry>> {
  // Get all entries that have entry_details with questions > 0
  const { data: entries, error: entriesError } = await supabase
    .from("entries")
    .select(`
      id, 
      date,
      entry_details!inner(
        id,
        questions_solved,
        topics:topic_id(id, name)
      )
    `)
    .gt("entry_details.questions_solved", 0)

  if (entriesError || !entries || entries.length === 0) {
    return {}
  }

  // Format the data
  const formattedData: Record<string, DSAEntry> = {}

  entries.forEach((entry) => {
    const entryData: DSAEntry = {}

    entry.entry_details.forEach((detail) => {
      if (detail.topics && detail.questions_solved > 0) {
        entryData[detail.topics.name] = detail.questions_solved
      }
    })

    // Only include entries that have at least one question solved
    if (Object.values(entryData).some((count) => count > 0)) {
      formattedData[entry.date] = entryData
    }
  })

  return formattedData
}

// Save an entry for a specific date
export async function saveEntry(date: string, entry: DSAEntry): Promise<boolean> {
  // Check if all values are zero - if so, delete the entry entirely
  const hasAnyQuestions = Object.values(entry).some((count) => count > 0)

  if (!hasAnyQuestions) {
    // Delete the entire entry if no questions were solved
    const { data: existingEntry } = await supabase.from("entries").select("id").eq("date", date).single()

    if (existingEntry) {
      // Delete entry details first (due to foreign key constraint)
      await supabase.from("entry_details").delete().eq("entry_id", existingEntry.id)

      // Then delete the entry itself
      const { error } = await supabase.from("entries").delete().eq("id", existingEntry.id)

      if (error) {
        console.error("Error deleting entry:", error)
        return false
      }
    }

    return true // Successfully "saved" (deleted) the empty entry
  }

  // Continue with normal save logic if there are questions solved
  const { data: topics } = await supabase.from("topics").select("id, name")

  if (!topics) return false

  const topicMap = topics.reduce(
    (map, topic) => {
      map[topic.name] = topic.id
      return map
    },
    {} as Record<string, number>,
  )

  // Check if entry already exists for this date
  const { data: existingEntry } = await supabase.from("entries").select("id").eq("date", date).single()

  let entryId: number

  if (existingEntry) {
    // Update existing entry
    entryId = existingEntry.id
    await supabase.from("entries").update({ updated_at: new Date().toISOString() }).eq("id", entryId)
  } else {
    // Create new entry
    const { data: newEntry, error: insertError } = await supabase.from("entries").insert({ date }).select("id").single()

    if (insertError || !newEntry) {
      console.error("Error creating entry:", insertError)
      return false
    }

    entryId = newEntry.id
  }

  // Delete existing entry details to replace them
  if (existingEntry) {
    await supabase.from("entry_details").delete().eq("entry_id", entryId)
  }

  // Insert new entry details (only for topics with questions > 0)
  const entryDetails = Object.entries(entry)
    .filter(([_, count]) => count > 0)
    .map(([topicName, count]) => ({
      entry_id: entryId,
      topic_id: topicMap[topicName],
      questions_solved: count,
    }))

  if (entryDetails.length > 0) {
    const { error: detailsError } = await supabase.from("entry_details").insert(entryDetails)

    if (detailsError) {
      console.error("Error saving entry details:", detailsError)
      return false
    }
  }

  return true
}
