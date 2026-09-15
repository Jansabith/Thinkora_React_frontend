// Shows a YouTube video inside the page, or a link for other video websites.
function VideoCard({ video }) {
  return (
    <div className="card video-card">
      {video.embed_url && (
        <div className="video-frame">
          <iframe
            src={video.embed_url}
            title={video.title}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      )}
      <h3>{video.title}</h3>
      {video.description && <p className="muted">{video.description}</p>}
      {!video.embed_url && (
        // rel="noopener noreferrer": the other website cannot control our page.
        <a href={video.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-small">
          Watch video ↗
        </a>
      )}
    </div>
  )
}

export default VideoCard
