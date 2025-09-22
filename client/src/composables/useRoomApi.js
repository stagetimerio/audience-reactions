const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export function useRoomApi () {
  async function fetchRoom (roomId) {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Room not found')
      }
      throw new Error(`Failed to fetch room: ${response.status}`)
    }

    const data = await response.json()
    return data
  }

  async function submitReaction (roomId, emoji) {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/react`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emoji }),
    })

    if (!response.ok) {
      throw new Error(`Failed to submit reaction: ${response.status}`)
    }

    const data = await response.json()
    return data
  }

  return {
    fetchRoom,
    submitReaction,
  }
}
