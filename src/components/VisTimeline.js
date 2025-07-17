import React, { useEffect, useRef } from 'react';
import { DataSet, Timeline } from 'vis-timeline/standalone';
// import 'vis-timeline/styles/vis-timeline-graph2d.min.css';

const VisTimeline = ({
  items = [],
  options = {},
  groups = [],
  onEvents = {},
}) => {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const datasetRef = useRef(null);

  useEffect(() => {
    datasetRef.current = new DataSet(items);
    const groupSet = new DataSet(groups);
    const timeline = new Timeline(containerRef.current, datasetRef.current, groupSet, options);
    timelineRef.current = timeline;


    // 기타 이벤트 등록
    Object.entries(onEvents).forEach(([eventName, handler]) => {
      if (typeof handler === 'function') {
        timeline.on(eventName, handler);
      }
    });

    return () => {
      if (timelineRef.current) timelineRef.current.destroy();
    };
  }, []);

  useEffect(() => {
    if (timelineRef.current && datasetRef.current) {
      datasetRef.current.update(items);
      timelineRef.current.setOptions(options);
      if (groups.length > 0) {
        timelineRef.current.setGroups(groups);
      }
    }
  }, [items, groups, options]);

  return <div ref={containerRef} style={{ overflow: 'auto' }} />;
};


export default VisTimeline;
