import React, { useState, useEffect, useRef } from 'react';
import { DataSet, Timeline } from 'vis-timeline/standalone';
// import 'vis-timeline/styles/vis-timeline-graph2d.min.css';

const VisTimeline = ({
  groups = [],
  items = [],
  options = {},
  onEvents = {},
  style = {}
}) => {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const datasetRef = useRef(null);
  const [groupHeightValue, setGroupHeightValue] = useState(0);
  const [itemHeightValue, setItemHeightValue] = useState(0);

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
    if (!timelineRef.current || !datasetRef.current) return;

    timelineRef.current.setOptions(options);
  }, [options]);
  
  
  useEffect(() => {
    if (!timelineRef.current) return;

    // 그룹 변경만 별도 관리
    if (groups.length > 0) {
      timelineRef.current.setGroups(groups);
    }

    const head_height = 51;
    const row_height = 29;
    const group_cnt = groups?.length || 0;
    setGroupHeightValue(group_cnt * row_height + head_height);

  }, [groups]);
  
  
  useEffect(() => {
    if (!timelineRef.current || !datasetRef.current) return;
    
    datasetRef.current.clear();
    datasetRef.current.update(items);
    
    const item_cnt = items?.length || 0;
    const item_height = 12;
    let first_row = 0;
    const chk = items.some((el) =>el.group === groups[0]?.id);
    if(chk) first_row += 15;
    setItemHeightValue(item_cnt * item_height + first_row);
    
  }, [items]);


  return <div ref={containerRef} style={{overflow:'auto', height: `${groupHeightValue + itemHeightValue}px`, ...style}} />;
};


export default VisTimeline;
