import React, { useState, useEffect, useRef, use } from 'react';
import VisTimeline from 'components/VisTimeline';
import dayjs from 'dayjs'
import isEqual from 'lodash/isEqual';

import axiosInstance from "utils/Axios";
import Modal from "components/Modal";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';
import { MainContentStyle } from "css/CommonStyle";

const Main = ({ isActive}) => {

  
  // selectbox
  const selectBox = useRef({}); 

  // 모달 ref
  const modalRef = useRef();  
  const modalRef2 = useRef();  
  
  const bg = useState([
    'bg-red',
    'bg-blue',
    'bg-teal',
    'bg-purple',
    'bg-orange',
    'bg-gray',
    'bg-indigo',
    'bg-hotPink',
    'bg-lightGreen',
    'bg-amber',
    'bg-mint',
    'bg-magenta',
    'bg-skyBlue',
    'bg-yellow',
    'bg-salmon',
    'bg-paleGreen',
    'bg-lavender',
    'bg-gold',
    'bg-coralRed',
    'bg-turquoise',
  ]);

  const [groups, setGroups] = useState([]);
  const [items, setItems] = useState([]);

  const options = {
    start: dayjs().startOf('day').toDate(),
    end: dayjs().add(1, 'day').endOf('day').toDate(), 
    min: dayjs().add(-1, 'day').startOf('day').toDate(),
    max: dayjs().add(2, 'day').endOf('day').toDate(), 
    timeAxis: { scale: 'hour', step: 2 }, // (필요시 강제 설정)
    stack: true,
    orientation: 'top',
    showCurrentTime: true, // 현재시간 세로줄
    showTooltips: true, // 툴팁 표시
    zoomMin: 1000 * 60 * 60 * 24 * 2,
    zoomMax: 1000 * 60 * 60 * 24 * 2,
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
    },
    snap: function (date, scale, step) {
      const ms = 1000 * 60 * 60; // 60분
      return new Date(Math.round(date.valueOf() / ms) * ms);
    },
    onMove: function (item, callback) {
      console.log("onMove");
      setData(item);
      if (item.content != null) {
        callback(item); // send back adjusted item
      }
      else {
        callback(null); // cancel updating the item
      }
    }

  };

  // 초기화
  useEffect(()=>{
    console.log("useEffect");

    if( !isActive ) return;


    axiosInstance
      .post(`/api/getProcess`, JSON.stringify({}))
      .then((res) => {
        const transformed = res.data.map((item, index) => ({
          id: item.process_code,
          content: item.process_name
        }));
        // 기존 groups 와 transformed 비교
        if (!isEqual(groups, transformed)) {
          console.log("groups", groups);
          // groups 가 변경되면 setGroups 호출
          // setGroups 는 useState 의 setter 함수로, 상태를 업데이트합니다.
          // transformed 는 새로운 상태 값입니다.
          // isEqual 을 사용하여 이전 상태와 비교하여 변경된 경우에만 업데이트합니다
          console.log("transformed", transformed);
  
          setGroups(transformed);
        }

        getData();
        
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger" });
      })
      .finally(() =>{
        
      });

  }, [isActive]);



  // 조회
  const getData = (params) => {
    console.log("getData");
    
    // setItems([]);

    axiosInstance
      .post(`/api/getWorkOrder`, JSON.stringify({type:"plan"}))
      .then((res) => {

        const arr_item = [ ...new Set(res.data.map(item => item.item_code))];
        
        const transformed = res.data.map((item) => {    
          const idx = arr_item.indexOf(item.item_code);
          const isEnd = item.status === 'end';

          const editable = {
            add: false,         // add new items by double tapping
            updateTime: true,  // drag items horizontally
            updateGroup: false, // drag items from one group to another
            remove: false,       // delete an item by tapping the delete button top right
            overrideItems: false  // allow these options to override item.editable
          };

          return ({
            id: item.idx,
            group: item.process_code,
            content: `[지시수량: ${item.order_qty}] ${item.item_name} - ${item.process_name}`,
            start: item.start_date+' '+item.start_time,
            end: item.end_date+' '+item.end_time,
            title: `${item.process_name} - ${item.item_name} <br> [지시수량: ${item.order_qty}] <br> ${item.start_date} ${item.start_time} ~ ${item.end_date} ${item.end_time} ${isEnd ? '/ 작업종료' : ''}`,
            className: isEnd ? 'bg-secondary' : bg[0][idx],
            editable: isEnd ? false : editable
          });
        });

        // 기존 groups 와 transformed 비교
        if (!isEqual(items, transformed)) {
          console.log("items", items);
          // items 가 변경되면 setItems 호출
          // setItems 는 useState 의 setter 함수로, 상태를 업데이트합니다.
          // transformed 는 새로운 상태 값입니다.
          console.log("transformed", transformed);
          
          setItems(transformed);
        }

        
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger" });
      })
      .finally(() =>{
        
      });
    
  };

  const setData = (item) =>{
    console.log("setData");
    console.log(item);

    const params = {
      id:item.id,
      start_date: dayjs(item.start).format('YYYY-MM-DD'),
      start_time: dayjs(item.start).format('HH:mm'),
      end_date: dayjs(item.end).format('YYYY-MM-DD'),
      end_time: dayjs(item.end).format('HH:mm'),
    };

    axiosInstance
      .post(`/api/setWorkOrderPlan`, JSON.stringify(params))
      .then((res) => {
        modalRef.current.open({ 
          title:"알림", 
          message:"적용되었습니다.", 
          content: 
          <div>
            <div>{`${item.content}`} </div> 
            <div>{`${dayjs(item.start).format('YYYY-MM-DD HH:mm')} - ${dayjs(item.end).format('YYYY-MM-DD HH:mm')}`}</div>
          </div>,
          cancelText:""
        });
        
        getData();
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger" });
      })
      .finally(() =>{
        
      });

  };


  return (
    <div style={MainContentStyle}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <div className="bg-light">
        <Row className="">
          <Col className="">
            <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
          
                  <td className="">
                    <Button size="sm" variant="primary" onClick={getData}><i className="bi bi-arrow-clockwise"></i></Button>
                  </td>
                  
                </tr>
              </tbody>
            </Table>

          </Col>
        </Row>
      </div>

      <div className="h-100">
        <Row  className="h-100">

          <Col className="d-flex flex-column" xs={12} md={12}>
            <div className="mb-1 d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold">설비별 생산계획</span>
              
            </div>
            
            <div style={{ width: '100%', height: '100%', minWidth:800, minHeight:600 }}>
              <VisTimeline groups={groups} items={items} options={options}/>

            </div>

       
          </Col>

          

        </Row>
      </div>
      
    </div>
  );
};

export default Main;
