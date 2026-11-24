import { useGameEngine } from '../game-engine';
import { ALL_BLINDS, BREAK_TIMES, LEVEL_TIMES } from '../utils';

export function LevelSettings() {
  const engine = useGameEngine()

  const handleClose = (evt) => {
    evt.stopPropagation();
    engine.toggleSettings()
  };

  const setLevelTime = (evt)=>{
    const minutes = parseInt(evt.target.value, 10);
    engine.setLevelDurationSeconds(minutes * 60);
  }

  const setBlinds = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    engine.setStartingBlind(parseInt(evt.target.value, 10));
  }

  const setBreakTime = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const minutes = parseInt(evt.target.value, 10);
    engine.setBreakDurationSeconds(minutes * 60);
  };

  return (
    <div id="lightbox" onClick={handleClose}>
      <div className="settings-panel"
        onClick={(evt) => evt.stopPropagation()}>

        <div className="settings-panel-control">
          <h3>Starting blind</h3>
          <select name="starting-blind" onChange={setBlinds} value={engine.blinds[0].small} >
            {ALL_BLINDS.slice(0, 5).map((blind) => (
              <option key={blind.small} value={blind.small}>
                {blind.small}
              </option>
            ))}
          </select>
        </div>

        <div className="settings-panel-control">
          <h3>Level time</h3>
          <select
            onChange={setLevelTime}
            defaultValue={engine.levelDurationSeconds / 60}
          >
            {LEVEL_TIMES.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>


        <div className="settings-panel-control break-settings">
          <h3>Break Duration</h3>
          <select
            onChange={setBreakTime}
            defaultValue={engine.breakDurationSeconds / 60}
          >
            {BREAK_TIMES.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
