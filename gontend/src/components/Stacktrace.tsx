import React from 'react';
import { Stacktrace } from '../types/event-data';
import ObjectTable from './ObjectTable';

const StacktraceView: React.SFC<{ stacktrace: Stacktrace }> = ({ stacktrace }) => {
  if (!stacktrace) {
    return null;
  }
  const frames = stacktrace.frames || [];
  if (!frames.length) {
    return null;
  }
  return (
    <div>
      <h2>Stacktrace</h2>
      <table className="stacktrace-table">
        <tbody>
          {frames.map((frame, frameIndex) => (
            <tr key={frameIndex} className="stacktrace-frame">
              <td className="stacktrace-code">
                {(frame.pre_context || []).map((l, i) => (
                  <div className="pre" key={`pre-${i}`}>
                    {l}
                  </div>
                ))}
                {frame.context_line ? <div>{frame.context_line}</div> : null}
                {(frame.post_context || []).map((l, i) => (
                  <div className="pre" key={`post-${i}`}>
                    {l}
                  </div>
                ))}
              </td>
              <td>
                <h2>
                  {frame.filename}:{frame.lineno} (<b>{frame.function}</b>)
                </h2>
                <ObjectTable className="stacktrace-vars" obj={frame.vars} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default StacktraceView;
