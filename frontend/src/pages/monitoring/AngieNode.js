const JumContexts = () => {
    return (
        <div style={{ diaplay:'flex', flexDirection:'column' }}>
            <div style={{ display:'flex', height:'250px' }}>
                <iframe src="http://localhost:3100/d-solo/5JC-1cank/angie?orgId=1&refresh=5s&panelId=2&theme=light" width='100%' frameBorder="0" title="CPU"></iframe>
            </div>
            <div style={{ display:'flex', height:'250px' }}>
                <iframe src="http://localhost:3100/d-solo/5JC-1cank/angie?orgId=1&refresh=5s&panelId=4&theme=light" width='100%' frameBorder="0" title="Memory"></iframe>
            </div>
            <div style={{ display:'flex', height:'250px' }}>
                <iframe src="http://localhost:3100/d-solo/5JC-1cank/angie?orgId=1&refresh=5s&panelId=6&theme=light" width='100%' frameBorder="0" title="Event loop delay"></iframe>
            </div>
            <div style={{ display:'flex', height:'250px' }}>
                <iframe src="http://localhost:3100/d-solo/5JC-1cank/angie?orgId=1&refresh=5s&panelId=8&theme=light" width='100%' frameBorder="0" title="Handlers"></iframe>
            </div>
        </div>
    );
}

export default JumContexts;
