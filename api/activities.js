import axios from "axios";

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

let access_token = null;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Tik GET leidžiamas" });
  }

  try {
    if (!access_token) {
      const tokenRes = await axios.post("https://www.strava.com/oauth/token", {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        grant_type: "refresh_token",
      });
      access_token = tokenRes.data.access_token;
    }

    const actRes = await axios.get("https://www.strava.com/api/v3/athlete/activities", {
      headers: { Authorization: `Bearer ${access_token}` },
      params: { per_page: 10 },
    });

    const simplified = actRes.data.map((act) => {
      return {
        name: act.name,
        coords: decodePolyline(act.map.summary_polyline),
      };
    });

    res.status(200).json(simplified);
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: "Klaida gaunant veiklas" });
  }
}

function decodePolyline(encoded) {
  if (!encoded) return [];
  let points = [];
  let index = 0,
    lat = 0,
    lng = 0;

  while (index < encoded.length) {
    let b, shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = (result & 1) ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = (result & 1) ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}