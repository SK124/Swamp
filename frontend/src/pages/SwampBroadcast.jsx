import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

const ICE_SERVERS = [
  { urls: 'stun:relay.metered.ca:80' },
  {
    urls: 'turn:relay.metered.ca:80',
    username: 'f656bb327ada11408d2cd592',
    credential: 'D5FTwyiln3XE0vFq',
  },
];

const API_BASE_URL = 'http://localhost:8080/api'; // base URL

const SwampBroadcast = () => {
  const location = useLocation();
  const { swampDetails } = location.state || {};
  const { swampId } = useParams();

  const [uuid, setUUID] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [connectionClosed, setConnectionClosed] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);

  const localVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const fetchSwampDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/swamp/${swampId}`, {
          method: 'GET',
          headers: {
            // 'Authorization': `Bearer ${your_auth_token}`
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch swamp details');
        }

        const data = await response.json();
        console.log('Received swamp data:', data);
        setUUID(data.UUID); // UUID will be available in the next useEffect
      } catch (error) {
        console.error('Error fetching swamp details:', error);
      }
    };

    fetchSwampDetails();
  }, [swampId]);

  // When UUID is set, start streaming
  useEffect(() => {
    if (uuid) {
      startStream();
    }
  }, [uuid]);

  useEffect(() => {
    return () => {
      // Close WebSocket
      if (wsRef.current) {
        wsRef.current.close();
      }

      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }

      // Stop all local media tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startStream = () => {
    console.log('Starting stream...');
    console.log('UUID:', uuid);
    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: { max: 1280 },
          height: { max: 720 },
          aspectRatio: 4 / 3,
          frameRate: 30,
        },
        audio: {
          sampleSize: 16,
          channelCount: 2,
          echoCancellation: true,
        },
      })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        connect(stream);
      })
      .catch(() => {
        setHasPermission(false);
      });
  };

  const connect = (stream) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peerConnectionRef.current = pc;

    const ws = new WebSocket(`ws://localhost:8081/room/${uuid}/websocket`);
    wsRef.current = ws;

    // Send local tracks to peer connection
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      if (event.track.kind === 'audio') return;

      const remoteStream = event.streams[0];
      setRemoteStreams((prev) => {
        if (prev.find((s) => s.id === remoteStream.id)) return prev;
        return [...prev, remoteStream];
      });

      remoteStream.onremovetrack = () => {
        setRemoteStreams((prev) =>
          prev.filter((s) => s.id !== remoteStream.id)
        );
      };
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        ws.send(
          JSON.stringify({
            event: 'candidate',
            data: JSON.stringify(e.candidate),
          })
        );
      }
    };

    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      if (!msg) return;

      switch (msg.event) {
        case 'offer': {
          const offer = JSON.parse(msg.data);
          pc.setRemoteDescription(offer);
          pc.createAnswer().then((answer) => {
            pc.setLocalDescription(answer);
            ws.send(
              JSON.stringify({
                event: 'answer',
                data: JSON.stringify(answer),
              })
            );
          });
          break;
        }
        case 'candidate': {
          const candidate = JSON.parse(msg.data);
          pc.addIceCandidate(candidate);
          break;
        }
        default:
          break;
      }
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      pc.close();
      peerConnectionRef.current = null;
      setRemoteStreams([]);
      setConnectionClosed(true);

      setTimeout(() => {
        if (!connectionClosed) return; // Don't retry if user refreshed or reconnected
        setConnectionClosed(false);
        connect(stream);
      }, 2000); // consider increasing the timeout or using exponential backoff
    };
  };

  return (
    <div className="p-4 space-y-6">
      <div className="text-sm text-gray-500">
        Viewers: {remoteStreams.length}
      </div>

      {!hasPermission && (
        <div className="bg-blue-100 p-4 rounded text-blue-700">
          <p>Camera and microphone permissions are needed to join the room.</p>
          <p>
            Otherwise, you can join the{' '}
            <a href="/stream" className="underline font-semibold">
              stream
            </a>{' '}
            as a viewer.
          </p>
        </div>
      )}

      {connectionClosed && (
        <div className="bg-red-100 p-4 rounded text-red-700">
          <p>Connection is closed!</p>
          <p>Please refresh the page.</p>
        </div>
      )}

      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        id="videos"
      >
        {/* Local Video */}
        <div className="rounded overflow-hidden border shadow">
          <video
            ref={localVideoRef}
            muted
            autoPlay
            playsInline
            className="w-full h-auto mirror"
          />
        </div>

        {/* Remote Streams */}
        {remoteStreams.length === 0 && (
          <div className="bg-blue-100 p-4 rounded text-blue-700 col-span-full">
            <p>No other streamer is in the room.</p>
            <p>Share your room link to invite your friends.</p>
            <p>Share your viewer link with your viewers.</p>
          </div>
        )}

        {remoteStreams.map((stream) => (
          <RemoteVideo key={stream.id} stream={stream} />
        ))}
      </div>
    </div>
  );
};

const RemoteVideo = ({ stream }) => {
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {
        const interval = setInterval(() => {
          videoRef.current
            .play()
            .then(() => clearInterval(interval))
            .catch(() => {});
        }, 3000);
      });
    }
  }, [stream]);

  return (
    <div className="rounded overflow-hidden border shadow">
      <video
        ref={videoRef}
        controls
        autoPlay
        playsInline
        className="w-full h-auto"
      />
    </div>
  );
};

export default SwampBroadcast;
