import React, { useState, useEffect, useRef } from 'react';
import { DataSet, Timeline } from 'vis-timeline/standalone';
// import 'vis-timeline/styles/vis-timeline-graph2d.min.css';
import dayjs from 'dayjs';

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

  const getMaxOverlapDate = (items) => {
    const dateCount = {};
    const dateItems = {};

    items.forEach(({ group, start, end }) => {
      // Date 객체로 변환
      let current = dayjs(start).format("YYYY-MM-DD");
      const endDate = dayjs(end).format("YYYY-MM-DD");

      // start ~ end 구간을 하루 단위로 순회
      while (current <= endDate) {
        const dateStr = dayjs(current).format("YYYY-MM-DD");

        // 날짜별 아이템 리스트 저장
        if (!dateItems[dateStr]) dateItems[dateStr] = [];
        dateItems[dateStr].push(group);

        // 날짜별 카운트
        dateCount[dateStr] = (dateCount[dateStr] || 0) + 1;

        // 하루 증가
        current = dayjs(current).add(1, 'day');
      }
    });
    // 가장 많이 포함된 날짜 찾기
    let maxDate = null;
    let maxCount = 0;

    for (const [date, count] of Object.entries(dateCount)) {
      if (count > maxCount) {
        maxCount = count;
        maxDate = date;
      }
    }

    // 중복 group 개수 계산

    const groups = dateItems[maxDate];
    let groupCounts = 0;
    if (Array.isArray(groups) && groups.length > 0){

        groupCounts = groups.reduce((acc, group) => {
            acc[group] = (acc[group] || 0) + 1;
            return acc;
        }, {});
    }
    
    const duplicateCount = Object.values(groupCounts).filter(c => c > 1).length;

    return { date: maxDate, total: maxCount, duplicateGroups: duplicateCount, groupCounts };
  };

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

    console.log(items);
    console.log(getMaxOverlapDate(items));

    const item_cnt = items?.length || 0;
    const item_height = 12;
    let first_row = 0;
    const chk = items.some((el) =>el.group === groups[0]?.id);
    console.log(chk);
    if(chk) first_row += 15;
    setItemHeightValue(item_cnt * item_height + first_row);
    
  }, [items]);


  return <div ref={containerRef} style={{overflow:'auto', height: `${groupHeightValue + itemHeightValue}px`, ...style}} />;
};


export default VisTimeline;
