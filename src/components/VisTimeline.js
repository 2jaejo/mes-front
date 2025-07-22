import React, { useEffect, useRef } from 'react';
import { DataSet, Timeline } from 'vis-timeline/standalone';
// import 'vis-timeline/styles/vis-timeline-graph2d.min.css';

const VisTimeline = ({
  groups = [],
  items = [],
  options = {},
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
    if (!timelineRef.current) return;

    // 그룹 변경만 별도 관리
    if (groups.length > 0) {
      timelineRef.current.setGroups(groups);
    }
  }, [groups]);

  useEffect(() => {
    if (!timelineRef.current || !datasetRef.current) return;

    timelineRef.current.setOptions(options);
    datasetRef.current.update(items);
  }, [items, options]);


  return <div ref={containerRef} style={{ width: '100%', height: '100%', minWidth:800, minHeight:600, overflow: 'auto' }} />;
};


export default VisTimeline;
