import axios from 'axios';

const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;

export async function generateZoomLink(
  title = 'Soro Session',
  duration = 60,
  startTime = null
) {
  try {
    // 1. Get Access Token
    const authString = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');
    
    const tokenResponse = await axios.post('https://zoom.us/oauth/token', 
      `grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
      {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    // 2. Create Scheduled Meeting
    const meetingPayload = {
      topic: title,
      type: 2, // Scheduled meeting
      duration,
      settings: {
        join_before_host: true, // Crucial setting
        waiting_room: false,
        host_video: false,
        participant_video: false,
        mute_upon_entry: true,
        meeting_authentication: false,
        auto_recording: "none",
        join_from_desktop: true,
        join_from_mobile: true,
        alternative_hosts: '',
        alternative_hosts_email_notification: false,
        encryption_type: 'enhanced_encryption',
        use_pmi: false
      }
    };

    // Add start time if provided
    if (startTime) {
      meetingPayload.start_time = startTime;
    }

    const meetingResponse = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      meetingPayload,
      {
        headers: {
          'Authorization': `Bearer ${tokenResponse.data.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      join_url: meetingResponse.data.join_url,
      password: meetingResponse.data.password,
      id: meetingResponse.data.id
    };
  } catch (error) {
    console.error('Zoom API Error:', error.response?.data || error.message);
    throw new Error('Failed to create Zoom meeting');
  }
}

export async function addAlternativeHosts(meetingId, emails) {
  try {
    const authString = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');
    const tokenResponse = await axios.post('https://zoom.us/oauth/token', 
      `grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
      {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    await axios.patch(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        settings: {
          alternative_hosts: emails.join(','),
          alternative_hosts_email_notification: true
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${tokenResponse.data.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Failed to add alternative hosts:', error);
  }
}