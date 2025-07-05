import React, { useEffect, useRef } from 'react';
import { DataSet, Timeline } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';
import dayjs from 'dayjs'

const VisTimeline = ({ items = [], options = {}, groups = [] }) => {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    console.log("useEffect");

    const dataset = new DataSet(items);
    const groupSet = new DataSet(groups);

    timelineRef.current = new Timeline(containerRef.current, dataset, groupSet, options);

    
    return () => {
      if (timelineRef.current) {
        timelineRef.current.destroy();
      }
    };
  }, []);

  // props 변경 시 업데이트
  useEffect(() => {
    console.log("useEffect2");
    if (timelineRef.current) {
      timelineRef.current.setItems(items);
      if (groups.length > 0) {
        timelineRef.current.setGroups(groups);
      }
      timelineRef.current.setOptions(options);

    }
  }, [items, groups, options]);

  return <div ref={containerRef} style={{  }} />;
};

export default VisTimeline;
