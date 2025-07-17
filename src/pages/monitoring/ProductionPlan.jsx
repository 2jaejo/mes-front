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

  const [items, setItems] = useState([]);

  const [groups, setGroups] = useState([]);


  const options = {
    start: dayjs().startOf('day').toDate(),
    end: dayjs().add(1, 'day').endOf('day').toDate(), 
    min: dayjs().add(-1, 'day').startOf('day').toDate(),
    max: dayjs().add(2, 'day').endOf('day').toDate(), 
    timeAxis: { scale: 'hour', step: 2 }, // (필요시 강제 설정)
    stack: true,
    // editable: {
    //   add: false,         // add new items by double tapping
    //   updateTime: true,  // drag items horizontally
    //   updateGroup: false, // drag items from one group to another
    //   remove: false,       // delete an item by tapping the delete button top right
    //   overrideItems: false  // allow these options to override item.editable
    // },
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

  const gridRef = useRef();  
  const selectedRow = useRef(0);



  // 그리드 onGridReady
  const onGridReady = (params) => {
    gridRef.current = params.api; // Grid API 저장

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      console.log("rowClicked");
      console.log(ev);
      selectedRow.current = ev.rowIndex; 

      const node = ev.node;
      if (!node.isSelected()) {
        node.setSelected(true);
      }
    });

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      console.log("cellValueChanged");
      console.log(ev);

    });

    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      console.log(ev);
      
      const selectedRows = ev.api.getSelectedRows();
      if( ev.source !== 'rowDataChanged' && selectedRows.length > 0 ){

      };

    });

  };
  



  // 초기화
  useEffect(()=>{
    console.log("useEffect");

    if( !isActive ) return;
    const init = {
      category: '',
      code: ['cd010', 'cd016', 'cd013', 'cd014']
    };

    axiosInstance
      .post(`/api/getDropDown`, JSON.stringify(init))
      .then((res) => {
        selectBox.current = res.data;

        axiosInstance
          .post(`/api/getProcess`, JSON.stringify({}))
          .then((res) => {
            const transformed = res.data.map((item, index) => ({
              id: item.process_code,
              content: item.process_name
            }));
            // 기존 groups 와 transformed 비교
            if (!isEqual(groups, transformed)) {
              setGroups(transformed);
              getData();
            }
            
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger" });
          })
          .finally(() =>{
            
          });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
      });  

  }, [isActive]);




  // 조회
  const getData = (params) => {
    console.log("getData");
    
    setItems([]);

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
          setItems(transformed);
        }


        // setItems([
        //   { id: "RT102234234", group:"RT101", content: '11x25 SS 개별 무지 오렌지 6187 200P_팩', start: dayjs().add(0, 'day').hour(9).minute(0).format('YYYY-MM-DD HH:mm:ss') , end: dayjs().add(0, 'day').hour(11).minute(0).format('YYYY-MM-DD HH:mm:ss'), className:'bg-primary'},
        //   { id: "RT10423423", group:"RT102", content: '디앙 11/25 SS (PLA 1P) 100개입 유백색', start: dayjs().add(0, 'day').hour(11).minute(0).format('YYYY-MM-DD HH:mm:ss') , end: dayjs().add(0, 'day').hour(14).minute(0).format('YYYY-MM-DD HH:mm:ss'), className:'bg-danger'},
        //   { id: "RT1022342341", group:"RT101", content: '마트용_디앙 스무디 11/21 SS 15개입', start: dayjs().add(0, 'day').hour(11).minute(0).format('YYYY-MM-DD HH:mm:ss') , end: dayjs().add(0, 'day').hour(12).minute(0).format('YYYY-MM-DD HH:mm:ss'), className:'bg-warning'},
        //   { id: "RT10dsfasdf", group:"RT103", content: '마트용_디앙 스무디 11/21 SS 15개입', start: dayjs().add(0, 'day').hour(11).minute(0).format('YYYY-MM-DD HH:mm:ss') , end: dayjs().add(0, 'day').hour(12).minute(0).format('YYYY-MM-DD HH:mm:ss'), className:'bg-warning'},
        //   { id: "RT10sdafas7", group:"RT104", content: '작업 D', start: dayjs().add(0, 'day').hour(13).minute(0).format('YYYY-MM-DD HH:mm:ss') , end: dayjs().add(0, 'day').hour(15).minute(0).format('YYYY-MM-DD HH:mm:ss')},
        // ]);
        
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
            
            <div>
              <VisTimeline items={items} options={options} groups={groups} />

            </div>

       
          </Col>

          

        </Row>
      </div>
      
    </div>
  );
};

export default Main;
