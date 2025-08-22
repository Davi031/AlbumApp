import axios from "axios"

let accessToken: string | null = null
let expiresAt: number = 0

export async function getSpotifyToken() {
    if (accessToken && Date.now() < expiresAt) return accessToken

    const clientId = process.env.SPOTIFY_CLIENT_ID!
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    const res = await axios.post(
        "https://accounts.spotify.com/api/token",
        "grant_type=client_credentials",
        { headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" } }
    )

    accessToken = res.data.access_token
    expiresAt = Date.now() + res.data.expires_in * 1000

    return accessToken
}

export async function searchAlbumsSpotify(query: string, limit: number = 20) {
    const token = await getSpotifyToken()

    const res = await axios.get('https://api.spotify.com/v1/search', {
        params: { q: query, type: 'album', limit },
        headers: { Authorization: `Bearer ${token}` }
    })

    return res.data.albums.items
}