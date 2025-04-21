import React, { useEffect, useRef, useState } from 'react';
import ChatWindow from '@/components/ChatWindow';


const ICE_SERVERS = [
  { urls: 'stun:relay.metered.ca:80' },
  {
    urls: 'turn:relay.metered.ca:80',
    username: 'f656bb327ada11408d2cd592',
    credential: 'D5FTwyiln3XE0vFq',
  },
];

const SwampStream = ({ noStream, streamWebsocketAddr }) => {
  const [peerStreams, setPeerStreams] = useState([]);
  const [connectionClosed, setConnectionClosed] = useState(false);
  const [streamerPresent, setStreamerPresent] = useState(false);
  const peerConnectionRef = useRef(null);
  const websocketRef = useRef(null);

  useEffect(() => {
    if (noStream) return;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peerConnectionRef.current = pc;

    const ws = new WebSocket(streamWebsocketAddr);
    websocketRef.current = ws;

    pc.ontrack = (event) => {
      if (event.track.kind === 'audio') return;

      const stream = event.streams[0];

      setPeerStreams((prev) => {
        // Avoid duplicates
        if (prev.find((s) => s.id === stream.id)) return prev;
        return [...prev, stream];
      });

      setStreamerPresent(true);

      stream.onremovetrack = () => {
        setPeerStreams((prev) => prev.filter((s) => s.id !== stream.id));
        if (peerStreams.length <= 1) setStreamerPresent(false);
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
      setPeerStreams([]);
      setConnectionClosed(true);
      setStreamerPresent(false);

      setTimeout(() => {
        setConnectionClosed(false);
        connectStream();
      }, 1000);
    };

    return () => {
      ws.close();
      pc.close();
    };
  }, [noStream]);

  if (noStream) {
    return (
      <div className="p-4">
        <div className="bg-red-500 text-white p-4 rounded">
          <p>There is no stream for the given Stream Link.</p>
          <p>Please join another stream room.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Video area (2/3) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="text-gray-500 text-sm">
          Viewers: {peerStreams.length}
        </div>
  
        {!streamerPresent && !connectionClosed && (
          <div className="bg-blue-100 p-4 rounded text-blue-700">
            <p>Hey! No streamer in the room.</p>
            <p>Please wait for the streamer.</p>
          </div>
        )}
  
        {connectionClosed && (
          <div className="bg-red-100 p-4 rounded text-red-700">
            <p>Connection is closed!</p>
            <p>Please refresh the page.</p>
          </div>
        )}
  
        <div
          id="peers"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        >
          {peerStreams.map((stream) => (
            <VideoStream key={stream.id} stream={stream} />
          ))}
        </div>
      </div>
  
      {/* Chat panel (1/3) */}
      <div className="lg:col-span-1 flex flex-col h-[600px] bg-white border rounded shadow">
        <div className="px-4 py-2 flex justify-between items-center bg-gray-900 text-white border-b border-gray-700 font-semibold">Live Chat</div>
        <ChatWindow uuid={suuid} inline />
      </div>
    </div>
  );
};

const VideoStream = ({ stream }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video && stream) {
      video.srcObject = stream;
      video.play().catch(() => {
        const interval = setInterval(() => {
          video
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

export default SwampStream;
