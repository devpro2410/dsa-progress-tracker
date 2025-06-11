import { supabase } from "./supabase"
import type { DSAEntry } from "@/app/page"

export interface PublicProfile {
  id: number
  slug: string
  name: string
  created_at: string
  updated_at: string
}

// Create or get a profile by slug
export async function createOrGetProfile(slug: string, name: string): Promise<PublicProfile | null> {
  // First try to get existing profile
  const { data: existingProfile } = await supabase
    .from("public_profiles")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (existingProfile) {
    return existingProfile
  }

  // Create new profile if it doesn't exist
  const { data: newProfile, error } = await supabase
    .from("public_profiles")
    .insert({
      slug,
      name,
    })
    .select("*")
    .single()

  if (error) {
    console.error("Error creating profile:", error)
    return null
  }

  return newProfile
}

// Get profile by slug
export async function getProfileBySlug(slug: string): Promise<PublicProfile | null> {
  const { data, error } = await supabase
    .from("public_profiles")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error) {
    return null
  }

  return data
}

// Get all entries for a profile
export async function getProfileEntries(profileId: number): Promise<Record<string, DSAEntry>> {
  // Get all entries for this profile
  const { data: entries, error: entriesError } = await supabase
    .from("public_entries")
    .select("id, date")
    .eq("profile_id", profileId)

  if (entriesError || !entries || entries.length === 0) {
    return {}
  }

  // Get all entry details with topics
  const { data: details, error: detailsError } = await supabase
    .from("public_entry_details")
    .select(`
      id, 
      entry_id, 
      questions_solved,
      topics:topic_id(id, name)
    `)
    .in(
      "entry_id",
      entries.map((e) => e.id),
    )

  if (detailsError) {
    console.error("Error fetching entry details:", detailsError)
    return {}
  }

  // Format the data
  const formattedData: Record<string, DSAEntry> = {}

  entries.forEach((entry) => {
    const entryDetails = details?.filter((d) => d.entry_id === entry.id) || []
    const entryData: DSAEntry = {}

    entryDetails.forEach((detail) => {
      if (detail.topics) {
        entryData[detail.topics.name] = detail.questions_solved
      }
    })

    formattedData[entry.date] = entryData
  })

  return formattedData
}

// Save an entry for a profile
export async function saveProfileEntry(profileId: number, date: string, entry: DSAEntry): Promise<boolean> {
  // Get topics for mapping
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
  const { data: existingEntry } = await supabase
    .from("public_entries")
    .select("id")
    .eq("date", date)
    .eq("profile_id", profileId)
    .single()

  let entryId: number

  if (existingEntry) {
    // Update existing entry
    entryId = existingEntry.id
    await supabase.from("public_entries").update({ updated_at: new Date().toISOString() }).eq("id", entryId)
  } else {
    // Create new entry
    const { data: newEntry, error: insertError } = await supabase
      .from("public_entries")
      .insert({
        date,
        profile_id: profileId,
      })
      .select("id")
      .single()

    if (insertError || !newEntry) {
      console.error("Error creating entry:", insertError)
      return false
    }

    entryId = newEntry.id
  }

  // Delete existing entry details to replace them
  if (existingEntry) {
    await supabase.from("public_entry_details").delete().eq("entry_id", entryId)
  }

  // Insert new entry details
  const entryDetails = Object.entries(entry)
    .filter(([_, count]) => count > 0)
    .map(([topicName, count]) => ({
      entry_id: entryId,
      topic_id: topicMap[topicName],
      questions_solved: count,
    }))

  if (entryDetails.length > 0) {
    const { error: detailsError } = await supabase.from("public_entry_details").insert(entryDetails)

    if (detailsError) {
      console.error("Error saving entry details:", detailsError)
      return false
    }
  }

  return true
}
