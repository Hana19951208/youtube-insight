interface Channel {
  slug: string;
  name: string;
  videoCount: number;
}

interface ChannelTabsProps {
  channels: Channel[];
  selectedChannel: string;
  onChannelChange: (slug: string) => void;
}

export default function ChannelTabs({
  channels,
  selectedChannel,
  onChannelChange,
}: ChannelTabsProps) {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex gap-4">
        <button
          onClick={() => onChannelChange('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            selectedChannel === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          全部频道
        </button>
        {channels.map((channel) => (
          <button
            key={channel.slug}
            onClick={() => onChannelChange(channel.slug)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              selectedChannel === channel.slug
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {channel.name} ({channel.videoCount})
          </button>
        ))}
      </nav>
    </div>
  );
}
