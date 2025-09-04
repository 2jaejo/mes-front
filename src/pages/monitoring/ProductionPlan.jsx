import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import VisTimeline from 'components/VisTimeline';
import dayjs from 'dayjs'
import isEqual from 'lodash/isEqual';

import axiosInstance from "utils/Axios";
import Modal from "components/Modal";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';
import { MainContentStyle } from "css/CommonStyle";
import { redirect } from 'react-router-dom';
import SearchableDropdown from "components/SearchableDropdown";
import SearchUserComponent from "components/SearchUserComponent";
import SalesOrderMgmt from "../production/SalesOrderMgmt";


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

  const groups = useRef([]);
  const groups2 = useRef([]);
  const groups3 = useRef([]);

  

  const [items, setItems] = useState([]);
  const [items2, setItems2] = useState([]);
  const [items3, setItems3] = useState([]);

  const events = {
    doubleClick: (e)=>{
      if(e.item){
        modalRef.current.open({ title:"알림", message:"이미 등록된 시간입니다.", cancelText:"", confirmClass:"btn btn-primary", autoCloseDelay:2000 });
        return;
      }

      const date = dayjs(e.snappedTime).format("YYYY-MM-DD");
      const start_time = dayjs(e.snappedTime).format("HH:mm");
      const end_time = dayjs(e.snappedTime).add(1, "hour").format("HH:mm");

      const data = {
        group: e.group,
        date,
        start_time,
        end_time
      };

      if(e.group.includes('RT1')){
        addData('압출', data);
      }
      else if (e.group.includes('RT2')) {
        addData('성형', data);
      }
      else if (e.group.includes('RT3')) {
        addData('포장', data);
      }
    },

  };

  const [today, setToday] = useState(dayjs().format('YYYY-MM-DD'));


  const options = useMemo(() => ({
    start: dayjs(today).startOf('day').toDate(),
    end: dayjs(today).add(1, 'day').endOf('day').toDate(), 
    min: dayjs(today).add(-1, 'day').startOf('day').toDate(),
    max: dayjs(today).add(2, 'day').endOf('day').toDate(), 
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
    },
    
  }), [today]);


  const dateChange = (e) => {
    setToday(e.target.value);
  }; 

  const [isReady, setIsReady] = useState(false);

  // 초기화
  useEffect(()=>{
    console.log("useEffect");

    if( !isActive ) return;

    axiosInstance
      .post(`/api/getProcess`, JSON.stringify({type:"status"}))
      .then((res) => {
        const g1 = [];
        const g2 = [];
        const g3 = [];

        for ( const item of res.data){
          if(item.process_type === '01') g1.push(item)
          if(item.process_type === '02') g2.push(item)
          if(item.process_type === '03') g3.push(item)
        } 
      
        
        const transformed1 = g1.map((item, index) => ({
          id: item.process_code,
          content: item.process_name
        })).filter((item, index, self) =>
          index === self.findIndex(t => t.id === item.id)
        );
        const transformed2 = g2.map((item, index) => ({
          id: item.process_code,
          content: item.process_name
        })).filter((item, index, self) =>
          index === self.findIndex(t => t.id === item.id)
        );
        const transformed3 = g3.map((item, index) => ({
          id: item.process_code,
          content: item.process_name
        })).filter((item, index, self) =>
          index === self.findIndex(t => t.id === item.id)
        );
        groups.current = transformed1;
        groups2.current = transformed2;
        groups3.current = transformed3;
        // console.log(groups3.current);
        // // 기존 groups 와 transformed 비교
        // if (!isEqual(groups, transformed)) {
        //   console.log("groups", groups);
        //   // groups 가 변경되면 setGroups 호출
        //   // setGroups 는 useState 의 setter 함수로, 상태를 업데이트합니다.
        //   // transformed 는 새로운 상태 값입니다.
        //   // isEqual 을 사용하여 이전 상태와 비교하여 변경된 경우에만 업데이트합니다
        //   console.log("transformed", transformed);
  
        //   setGroups(transformed);
        // }

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
    
    setItems([]);
    setItems2([]);
    setItems3([]);

    setIsReady(false);
    axiosInstance
      .post(`/api/getWorkOrder`, JSON.stringify({type:"plan", date: today}))
      .then((res) => {
        const arr_item = [ ...new Set(res.data.map(item => item.item_code))];
        
        const transformed = res.data.map((item) => {    
          const idx = arr_item.indexOf(item.item_code);
          const isEnd = item.status === 'end';

          const editable = {
            add: false,         // add new items by double tapping
            updateTime: true,  // drag items horizontally
            updateGroup: true, // drag items from one group to another
            remove: false,       // delete an item by tapping the delete button top right
            overrideItems: false  // allow these options to override item.editable
          };

          return ({
            id: item.idx,
            group: item.process_code,
            content: `${isEnd ? '작업종료':''} [지시수량: ${item.order_qty}] ${item.item_name} - ${item.process_name}`,
            start: item.start_date+' '+item.start_time,
            end: item.end_date+' '+item.end_time,
            title: `${item.process_name} - ${item.item_name} <br> [지시수량: ${item.order_qty}] <br> ${item.start_date} ${item.start_time} ~ ${item.end_date} ${item.end_time} ${isEnd ? '/ 작업종료' : ''}`,
            className: isEnd ? 'bg-grey' : bg[0][idx],
            editable: isEnd ? false : editable,
            data: item
          });
        });

        const i1 = [];
        const i2 = [];
        const i3 = [];

        for ( const item of transformed){
          if(item.data.process_type === '01') i1.push(item)
          if(item.data.process_type === '02') i2.push(item)
          if(item.data.process_type === '03') i3.push(item)
        } 

        setItems(i1);
        setItems2(i2);
        setItems3(i3);
        
        // 기존 groups 와 transformed 비교
        // if (!isEqual(items, transformed)) {
        //   console.log("items", items);
        //   // items 가 변경되면 setItems 호출
        //   // setItems 는 useState 의 setter 함수로, 상태를 업데이트합니다.
        //   // transformed 는 새로운 상태 값입니다.
        //   console.log("transformed", transformed);
        //   setItems(transformed);
        // }

        
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger" });
      })
      .finally(() =>{
        setIsReady(true);
      });
    
  };

  const setData = (item) =>{
    console.log("setData");
    // console.log(item);

    const params = {
      id:item.id,
      process_code: item.group,
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

  const propsRef = useRef();

  const addData = (params, data={}) => {
    console.log("addData");

    let arr = [];
    if (params === '압출'){
      arr = groups.current;
    }
    else if( params === '성형'){
      arr = groups2.current;
    }
    else if ( params === '포장'){
      arr = groups3.current;
    }

    if(data){
      propsRef.current = {
        sel_box: arr,
        process_code: data.group,
        start_date:data.date,
        start_time:data.start_time,
        end_date:data.date,
        end_time:data.end_time,
        remark:"",
        quantity:"",
        item_code:"",
      };
    }
    else{
      propsRef.current = {
        sel_box : arr,
      };

    }

    modalRef.current.open({
      title: `${params} 추가`,
      content: <ModalComponent props={propsRef} />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"추가",
      confirmClass:"btn btn-success",
      onConfirm: (res) => {
  
        const excludeKeys = ["order_id", "sel_box", "remark"]; 
        const isEmptyExceptExcluded = Object.entries(propsRef.current)
          .filter(([key]) => !excludeKeys.includes(key)) 
          .some(([_, value]) => value === 0 || value === "" || value === null || value === undefined);
        
        if (isEmptyExceptExcluded){
          modalRef2.current.open({ title:"알림", message:"비어있는 항목이 있습니다.", cancelText:"", confirmClass:"btn btn-primary" });
          return;
        }

        const data = {
          sel_row:[propsRef.current]
        }

        modalRef.current.update({isLoading:true});
        axiosInstance
          .post(`/api/addWorkOrder`, JSON.stringify(data))
          .then((res) => {
            getData();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            modalRef2.current.open({ title:"알림", message:error.message, cancelText:"" });
          })
          .finally(() =>{
            modalRef.current.update({isLoading:false});
            modalRef.current.close();
          });

      }, 
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
                    <Form.Control 
                      type="date"
                      name="date"
                      value={today}
                      onChange={dateChange}
                      size="sm" 
                      className="w-auto"
                      placeholder=""
                      maxLength={50}
                    />
                  </td>
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

          <Col className="pb-5 d-flex flex-column" xs={12} md={12}>
            <div className="mb-1 d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold">압출</span>
            </div>
            <div className="mb-2 border" style={{ width: '100%', height: '100%'}}>
              {isActive && isReady ? (
                <VisTimeline
                  groups={groups.current}
                  items={items}
                  options={options}
                  onEvents={events}
                />
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div>
                    <button className="btn btn-primary" type="button" disabled>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Loading...
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-1 d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold">성형</span>
            </div>
            <div className="mb-2 border" style={{ width: '100%', height: '100%' }}>
              {isActive && isReady ? (
                <VisTimeline
                  groups={groups2.current}
                  items={items2}
                  options={options}
                  onEvents={events}
                />
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div>
                    <button className="btn btn-primary" type="button" disabled>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Loading...
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-1 d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold">포장</span>
            </div>
            <div className="mb-2 border" style={{ width: '100%', height: '100%' }}>
              {isActive && isReady ? (
                <VisTimeline
                  groups={groups3.current}
                  items={items3}
                  options={options}
                  onEvents={events}
                />
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div>
                    <button className="btn btn-primary" type="button" disabled>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Loading...
                    </button>
                  </div>
                </div>
              )}
            </div>

       
          </Col>

          

        </Row>
      </div>
      
    </div>
  );
};

export default Main;



const ModalComponent = ({ props={} }) => {
  console.log("ModalComponent");
  
  // props
  const [modalForm, setModalForm] = useState(props.current);
  const modalFormChange = (e) => {
    const { name, value } = e.target;
    setModalForm(prev => ({ ...prev, [name]: value }));
    props.current[name] = value;
  };

  const modalRef = useRef();
  const modalRef2 = useRef();
  const selectBox = useRef({});
  const [selectBox2, setSelectBox2] = useState({});

  // 초기화 selectbox list
  useEffect(()=>{
    console.log("useEffect");
    let isMounted = true;

    const init = {
      code: ['cd014']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      if (isMounted) {
        selectBox.current = res.data;
        setSelectBox2(res.data);

      }
    })
    .catch((error) =>{
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
    });

    return () => {
      isMounted = false; // cleanup
    };

  },[]);


  const [options, setOptions] = useState([]);

  useEffect(()=>{
    axiosInstance
      .post(`/api/getItem`, JSON.stringify())
      .then((res) => {
        
        const newData = res.data.map(el => ({
          ...el,
          name : `[${el.item_dotno}] ${el.item_name}`,
          value: `${el.item_dotno}`
        }));
        
        setOptions(newData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
      })
      .finally(() =>{

      });

  },[]);

  const [selectedName, setSelectedName] = useState('');
  const [selectedValue, setSelectedValue] = useState('');

  const handleSelect = (option) => {
    setSelectedName(option.name);
    setSelectedValue(option.value);

    modalFormChange({target:{name:'order_id', value:option.sales_id}});
    modalFormChange({target:{name:'item_code', value:option.value}});
    // // form에 적용
    // setFormData((prev) => ({
    //   ...prev,
    //   ...option
    // }));
    
  };


  const formRef2 = useRef();

  // 조회2
  const getData2 = (params) => {

    formRef2.current = {
      start_dt: "",
      end_dt: "",
      status:"",
      sales_id:"",
      client_code:"",
      client_name:"",
      sel_rows:[]
    };


    // formRef2.current = {
    //   "intNowPage": 1,
    //   "maxCnt": 0,
    //   "dateValue": "3",
    //   stdate: dayjs().add(-7, 'day').format('YYYY-MM-DD'),
    //   endate: dayjs().format('YYYY-MM-DD'),
    //   "orderValue": "",
    //   "transType": "",
    //   "orderStatus": "",
    //   "shipedStatus": "",
    //   "cancelYn": "",
    //   "storageName": "",
    //   "mediaOrderNo01": "",
    //   "mediaName": "",
    //   "invoceNo": "",
    //   "orderCode": "",
    //   sel_row:[],
    // };


    modalRef.current.open({
      title: "수주 조회",
      content: <SalesOrderMgmt props={formRef2} isModal={true} />,
      // content: <ModalSalesOrderComponent props={formRef2} />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"확인",
      confirmClass:"btn btn-primary",
      onConfirm: (res) => {
        const rows = formRef2.current.sel_rows;
        const row = rows[0];
        const newData = rows.map(el => ({
          ...el,
          name : `[${el.item_dotno}] ${el.item_name}`,
          value: `${el.item_dotno}`
        }));
        
        if(!rows || rows.length === 0){
          modalRef2.current.open({ title:"알림", message:"수주의 상세품목을 선택하세요.", cancelText:"" });
          return;
        }

        handleSelect(newData[0], 'sales');
        modalRef.current.close();

      }, 
    });
    
  };


  const formRef4 = useRef();

  // 조회4
  const getData4 = (params) => {
    console.log("getData4");
    

    formRef4.current = {
      sel_row:{},
    };

    modalRef.current.open({
      title: "사용자 조회",
      content: <SearchUserComponent form={formRef4} />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"확인",
      confirmClass:"btn btn-primary",
      onConfirm: (res) => {
        const row = formRef4.current.sel_row;
        
        if(!row || Object.keys(row).length === 0){
          modalRef2.current.open({ title:"알림", message:"사용자를 선택하세요.", cancelText:"" });
          return;
        }
        
      

        modalFormChange({target:{name:'user_id', value:row.user_id}});
        modalFormChange({target:{name:'user_nm', value:row.user_nm}});

    

        modalRef.current.close();

      }, 
    });
    
  };

  return (
    <div style={{ width:'auto', display: 'flex', flexDirection: 'column' }}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <div className="mb-2">
        <Row className="">
          <Col className="d-flex gap-2">
            <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  <th className="bg-light text-end align-middle">수주번호</th>
                  <td className="">
                    <div className='d-flex gap-2 align-items-center'>
                      <Form.Control 
                        type="text"
                        name="order_id"
                        value={modalForm.order_id}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
                        placeholder=""
                        maxLength={50}
                        disabled
                      />
                      <Button size="sm" variant="primary" onClick={getData2}><i className="bi bi-search"></i></Button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th className="bg-light text-end align-middle">공정</th>
                  <td className="">
                    <Form.Select 
                      name="process_code" 
                      value={modalForm.process_code} 
                      onChange={modalFormChange}
                      size="sm"
                      className="w-100"
                    >
                      <option value="">선택</option>
                      {(props.current.sel_box || [])
                        .map(opt => (
                          <option key={opt.id} value={opt.id}>
                            {opt.content}
                          </option>
                      ))}
                    </Form.Select>
                  </td>
                </tr>
                <tr>
                  <th className="bg-light text-end align-middle">시간</th>
                  <td className="">
                    <div className='d-flex gap-2 align-items-center'>
                      <Form.Control 
                        type="date"
                        name="start_date"
                        value={modalForm.start_date}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
                        placeholder=""
                        maxLength={50}
                      />
                      <Form.Select 
                        name="start_time" 
                        value={modalForm.start_time} 
                        onChange={modalFormChange}
                        size="sm"
                        className="w-auto"
                      >
                        <option value="">선택</option>
                        {(selectBox2.common?.['cd014'] || [])
                          .filter(opt => opt.use_yn === 'Y')
                          .map(opt => (
                            <option key={opt.code} value={opt.code}>
                              {opt.code_name}
                            </option>
                        ))}
                      </Form.Select>
                      <span className="p-1"> ~ </span>
                      <Form.Control 
                        type="date"
                        name="end_date"
                        value={modalForm.end_date}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
                        placeholder=""
                        maxLength={50}
                      />
                      <Form.Select 
                        name="end_time" 
                        value={modalForm.end_time} 
                        onChange={modalFormChange}
                        size="sm"
                        className="w-auto"
                      >
                        <option value="">선택</option>
                        {(selectBox2.common?.['cd014'] || [])
                          .filter(opt => opt.use_yn === 'Y')
                          .map(opt => (
                            <option key={opt.code} value={opt.code}>
                              {opt.code_name}
                            </option>
                        ))}
                      </Form.Select>
                    </div>
                    
                  </td>
                </tr>

                <tr>
                  <th className="bg-light text-end align-middle">제품</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <SearchableDropdown
                        options={options}
                        selected={selectedName}
                        onSelect={handleSelect}
                        title={"제품 선택"}
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <th className="bg-light text-end align-middle">담당자</th>
                  <td className="">
                    <div className='d-flex gap-2 align-items-center'>
                      <Form.Control 
                        type="text"
                        name="user_id"
                        value={modalForm.user_id}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
                        placeholder=""
                        maxLength={50}
                        disabled
                        style={{display:'none'}}
                      />
                      <Form.Control 
                        type="text"
                        name="user_nm"
                        value={modalForm.user_nm}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
                        placeholder=""
                        maxLength={50}
                        disabled
                      />
                      <Button size="sm" variant="primary" onClick={getData4}><i className="bi bi-search"></i></Button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th className="bg-light text-end align-middle">수량</th>
                  <td className="">
                    <div className='d-flex align-items-center'>
                      <Form.Control 
                        type="number"
                        name="quantity"
                        value={modalForm.quantity}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-100"
                        placeholder=""
                        maxLength={50}
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <th className="bg-light text-end align-middle">비고</th>
                  <td className="">
                    <div className='d-flex align-items-center'>
                      <Form.Control 
                        type="text"
                        name="remark"
                        value={modalForm.remark}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-100"
                        placeholder=""
                        maxLength={50}
                      />
                    </div>
                  </td>
                </tr>

              </tbody>
            </Table>
          </Col>
        </Row>
      </div>

      <div className="h-100">
        <Row  className="h-100">
          <Col className="h-100 d-flex flex-column" xs={12} md={12}>
            
          </Col>

        </Row>

      </div>


    </div>
  );
}