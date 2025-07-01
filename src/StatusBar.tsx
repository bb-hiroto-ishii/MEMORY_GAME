import "./status-bar.css"; // スタイルは別ファイルで管理（次に説明）

const StatusBar = ({ point, comboCount }: { point: number; comboCount: number }) => {
    return (
        <div className="status-bar">
            <div className="status-row">
                <span className="label">POINT :</span>
                <div className="point-display">{point}</div>
            </div>
            <div className="status-row">
                <span className="label">COMBO :</span>
                <div className="combo-display">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className={`combo-box ${i < comboCount ? "filled" : "empty"} ${comboCount == 8 ? "blink-slow" : ""}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StatusBar;
