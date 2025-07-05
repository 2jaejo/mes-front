import React, { useState, useEffect, useRef, use } from 'react';
import VisTimeline from 'components/VisTimeline';
import dayjs from 'dayjs'

const Main = () => {

  const [items, setItems] = useState([]);
  const [items2, setItems2] = useState([]);
  const [items3, setItems3] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groups2, setGroups2] = useState([]);
  const [groups3, setGroups3] = useState([]);

  useEffect(() => {
    setItems([
      { id: 1, group:1, content: '11x25 SS 개별 무지 오렌지 6187 200P_팩', start: dayjs().add(0, 'day').hour(9).minute(0).format('YYYY-MM-DD HH:mm:ss') , end: dayjs().add(0, 'day').hour(11).minute(0).format('YYYY-MM-DD HH:mm:ss'), className:'bg-primary'},
      { id: 2, group:2, content: '디앙 11/25 SS (PLA 1P) 100개입 유백색', start: dayjs().add(0, 'day').hour(11).minute(0).format('YYYY-MM-DD HH:mm:ss') , end: dayjs().add(0, 'day').hour(14).minute(0).format('YYYY-MM-DD HH:mm:ss'), className:'bg-danger'},
      { id: 3, group:3, content: '마트용_디앙 스무디 11/21 SS 15개입', start: dayjs().add(0, 'day').hour(11).minute(0).format('YYYY-MM-DD HH:mm:ss') , end: dayjs().add(0, 'day').hour(12).minute(0).format('YYYY-MM-DD HH:mm:ss'), className:'bg-warning'},
      { id: 4, group:4, content: '작업 D', start: dayjs().add(0, 'day').hour(13).minute(0).format('YYYY-MM-DD HH:mm:ss') , end: dayjs().add(0, 'day').hour(15).minute(0).format('YYYY-MM-DD HH:mm:ss')},
    ]);
    setItems2([
      { id: 5, group:5, content: '11x25 SS 개별 무지 오렌지 6187 200P_팩', start: dayjs().add(0, 'day').hour(9).minute(0).format('YYYY-MM-DD HH:mm:ss') , end: dayjs().add(0, 'day').hour(10).minute(0).format('YYYY-MM-DD HH:mm:ss'), className:'bg-primary'},
      { id: 6, group:6, content: '디앙 11/25 SS (PLA 1P) 100개입 유백색', start: dayjs().add(0, 'day').hour(10).minute(0).format('YYYY-MM-DD HH:mm:ss') , end: dayjs().add(0, 'day').hour(11).minute(0).format('YYYY-MM-DD HH:mm:ss'), className:'bg-danger'},
      { id: 7, group:7, content: '작업 G', start: dayjs().add(0, 'day').hour(12).minute(0).format('YYYY-MM-DD HH:mm:ss') , end: dayjs().add(0, 'day').hour(13).minute(0).format('YYYY-MM-DD HH:mm:ss')},
      { id: 8, group:8, content: '작업 H', start: dayjs().add(0, 'day').hour(14).minute(0).format('YYYY-MM-DD HH:mm:ss') , end: dayjs().add(0, 'day').hour(16).minute(0).format('YYYY-MM-DD HH:mm:ss')},
   ]);
    setItems3([
      { id: 9, group:9, content: '11x25 SS 개별 무지 오렌지 6187 200P_팩', start: dayjs().add(0, 'day').hour(9).minute(0).format('YYYY-MM-DD HH:mm:ss') , end: dayjs().add(0, 'day').hour(10).minute(0).format('YYYY-MM-DD HH:mm:ss'), className:'bg-primary'},
      { id: 10, group:10, content: '디앙 11/25 SS (PLA 1P) 100개입 유백색', start: dayjs().add(0, 'day').hour(10).minute(0).format('YYYY-MM-DD HH:mm:ss') , end: dayjs().add(0, 'day').hour(11).minute(0).format('YYYY-MM-DD HH:mm:ss'), className:'bg-danger'},
      { id: 11, group:11, content: '마트용_디앙 스무디 11/21 SS 15개입', start: dayjs().add(0, 'day').hour(12).minute(0).format('YYYY-MM-DD HH:mm:ss') , end: dayjs().add(0, 'day').hour(13).minute(0).format('YYYY-MM-DD HH:mm:ss'), className:'bg-warning'},
      { id: 12, group:12, content: '작업 L', start: dayjs().add(0, 'day').hour(14).minute(0).format('YYYY-MM-DD HH:mm:ss') , end: dayjs().add(0, 'day').hour(16).minute(0).format('YYYY-MM-DD HH:mm:ss')}
    ]);

    setGroups([
      { id: 1, content: '압출기 A' },
      { id: 2, content: '압출기 B' },
      { id: 3, content: '압출기 C' },
      { id: 4, content: '압출기 D' },
    ]);
    setGroups2([
      { id: 5, content: '가공기 E' },
      { id: 6, content: '가공기 F' },
      { id: 7, content: '가공기 G' },
      { id: 8, content: '가공기 H' },
    ]);
    setGroups3([
      { id: 9, content: '포장기 I' },
      { id: 10, content: '포장기 J' },
      { id: 11, content: '포장기 K' },
      { id: 12, content: '포장기 L' }
    ]);

 

  }, []);


  const options = {
    start: dayjs().startOf('day').toDate(),
    end: dayjs().add(1, 'day').endOf('day').toDate(), 
    min: dayjs().startOf('day').toDate(),
    max: dayjs().add(2, 'day').endOf('day').toDate(), 
    stack: true,
    editable: true,
    orientation: 'top',
    showCurrentTime: true, // 현재시간 세로줄
    showTooltips: true, // 툴팁 표시
    zoomMin: 1000 * 60 * 60 * 24 * 1,
    zoomMax: 1000 * 60 * 60 * 24 * 1.5,
    timeAxis: { scale: 'hour', step: 1 }, // (필요시 강제 설정)
    format: {
      minorLabels: {
        millisecond:'SSS',
        second:     's',
        minute:     'HH:mm',
        hour:       'HH:mm',
        weekday:    'ddd D',
        day:        'D',
        week:       'w',
        month:      'MMM',
        year:       'YYYY'
      },
      majorLabels: {
        millisecond:'HH:mm:ss',
        second:     'HH:mm:ss',
        minute:     'YYYY-MM-DD',
        hour:       'YYYY-MM-DD',
        weekday:    'YYYY-MM-DD',
        day:        'YYYY-MM-DD',
        week:       'YYYY-MM-DD',
        month:      'YYYY-MM-DD',
        year:       'YYYY-MM-DD'
      }
    }
  };

  return (
    <div style={{ height: '87vh', display: 'flex', flexDirection: 'column' }}>
      <h2>설비 작업 스케줄</h2>
      <VisTimeline items={items} options={options} groups={groups} />
      <VisTimeline items={items2} options={options} groups={groups2} />
      <VisTimeline items={items3} options={options} groups={groups3} />
    </div>
  );
};

export default Main;
