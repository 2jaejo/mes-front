import React, { useState, useEffect, useRef } from "react";

import axiosInstance from "utils/Axios";
import Modal from "components/Modal";
import { Row, Col, Form, Button, Table, Spinner } from 'react-bootstrap';
import dayjs from 'dayjs';

const Main = ({ props={}, isActive}) => {
  const modalRef = useRef();  
  const modalRef2 = useRef();  

  // selectbox
  const selectBox = useRef({});
  const selectBox2 = useRef([]);
  
  const [start, setStart] = useState(false);
  const [pause, setPause] = useState(false);
  const [end, setEnd] = useState(false);
  const [sheetLoading, setSheetLoading] = useState(false);
  
  const old_result = useRef(0);
  const old_defect = useRef(0);
  const old_remark = useRef('');

  const formRef = useRef({
    created_at: '',
    created_by: '',
    defect_qty: '',
    end_date: '',
    end_dttm: '',
    end_time: '',
    idx: '',
    item_code: '',
    item_name: '',
    order_qty: '',
    pause: '',
    process_code: '',
    process_name: '',
    remark: '',
    result_id: '',
    result_qty: '',
    sales_id: '',
    start_date: '',
    start_dttm: '',
    start_time: '',
    status: '',
    updated_at: '',
    updated_by: '',
    work_id: '',
    work_idx: '',
    worker_id: ''
  });
  
  const [modalForm, setModalForm] = useState(formRef.current);
  
  const modalFormChange = (e) => {
    const { name, value } = e.target;
    setModalForm(prev => ({ ...prev, [name]: value }));
    if(formRef.current){
      formRef.current[name] = value;
    }

    if(name === 'work_idx'){
      getData();
    }
  };
  

  // 초기화
  useEffect(()=>{
    console.log("useEffect");
    
    if( !isActive ) return;

    axiosInstance
      .post(`/api/getWorkResult`, JSON.stringify({type:'list'}))
      .then((res) => {
        
        selectBox2.current = res.data;

        const currentIdx = modalForm.work_id; // 또는 form?.work_id
        const matched = res.data.find(item => item.work_idx === currentIdx);

        // 있으면 그대로 유지, 없으면 첫 번째 값 사용
        const nextIdx = matched ? matched.work_idx : res.data?.[0]?.work_idx;

        modalFormChange({target:{ name:"work_idx", value: nextIdx}});

        // getData();
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
      });  

   

  },[isActive]);


  // 조회
  const getData = (params) => {
    console.log("getData");

    if(!formRef.current.work_idx) return;
    
    axiosInstance
      .post(`/api/getWorkResult`, JSON.stringify({type:'search', work_idx:formRef.current.work_idx}))
      .then((res) => {
        
        if(res.data.length === 0) return;

        const row = res.data[0];
        setModalForm(row);
        formRef.current = { ...row };  
        old_result.current = row.result_qty;
        old_defect.current = row.defect_qty;
        old_remark.current = row.remark;

        const start = row.start_dttm === null || row.start_dttm === '';
        const pause = !start && row.end_dttm === null || row.end_dttm === '';
        const end = !start && row.end_dttm === null || row.end_dttm === '';
        setStart(!start);
        setPause(!pause);
        setEnd(!end);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger" });
      })
      .finally(() =>{
        
      });
    
  };

  // 조회2
  const getData2 = (params) => {
    console.log("getData2");

    if( !formRef.current.process_code.includes('RT1'))  return;
    
    setSheetLoading(true);

    axiosInstance
      .post(`/api/getSheet`, JSON.stringify({}))
      .then((res) => {
        const rows = res.data.data;
        
        // const filtered_row = rows.find( el=> el[2] === 'B-PP-00019-C');
        const filtered_row = rows.find( el=> el[1] === modalForm.bar_code);
        if (filtered_row){
          modalFormChange({target:{name:'result_qty', value:parseInt(filtered_row[6])}});
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger" });
      })
      .finally(() =>{
        setSheetLoading(false);

      });
    
  };


  const call_status = useRef(false);

  // 수정
  const setData = (params) => {
    console.log("setData");
    if( formRef.current.process_code === '' || formRef.current.process_code === undefined) return ;

    if( call_status.current ) return;

    call_status.current = true;
    axiosInstance
    .post("api/setWorkResult", JSON.stringify(params))
    .then((res) => {
      modalRef.current.open({ title:"알림", message:"적용되었습니다.", cancelText:"" });

      getData();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
    })
    .finally(() =>{
      call_status.current = false;
    });

  };



  // 적용
  const setQty = (params) =>{
    
    if( formRef.current.process_code === '' || formRef.current.process_code === undefined) return ;


    let new_val = formRef.current[params];
    
    const newData = {
      ...formRef.current,
      [params]:new_val,
      type: params,
      newValue:new_val,
    };
    
    if(params === "result_qty"){
      newData.oldValue = old_result.current;
    }
    else if(params === "defect_qty"){
      newData.oldValue = old_defect.current;
    }
    else if(params === "remark"){
      newData.oldValue = old_remark.current;
    }


    if(newData.oldValue === newData.newValue) return;
    setData(newData);

    
  };


  // 버튼클릭 
  const buttonCliked = (params) => {
    console.log("setData");

    if(params === 'start_dttm'){
      const newData = {
        ...formRef.current,
        type: params,
        oldValue: formRef.current.start_dttm,
        newValue: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        [params]: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };
      
      setData(newData);
    }


    if(params === 'end_dttm' && (formRef.current.start_dttm === '' || formRef.current.start_dttm === null) ){
      modalRef.current.open({ title:"오류", message:"작업시작을 먼저 진행해주세요.", cancelText:"" });
      return;
    }
    
    if(params === 'end_dttm'){
      modalRef.current.open({
        title: "알림",
        message: "정말 작업종료 하시겠습니까?",
        confirmText:"작업종료",
        confirmClass:"btn btn-danger",
        onCancel: ()=>{
          modalRef.current.close();
        },
        onConfirm: (res) => {
          const newData = {
            ...formRef.current,
            type: params,
            oldValue: formRef.current.end_dttm,
            newValue: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            [params]: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          };
          
          setData(newData);
          modalRef.current.close();

        }, 
      });
    }

    if(params === "pause"){
      console.log("pause");
      const yn = formRef.current.pause;
      const new_yn = yn === 'Y' ? 'N' : 'Y';
      const newData = {
        ...formRef.current,
        type: params,
        oldValue: yn,
        newValue: new_yn,
        [params]: new_yn,
      };
      
      setData(newData);
    }

  };


 
  return (
    <div style={{ height: '87vh', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <div className="bg-light">
        <Row className="h-100">
          <Col className="h-100">

            <Table bordered hover style={{ width: 'auto' , fontSize:"1.4rem"}} className="m-0">
              <tbody>
                <tr>
                  <th className="p-4 bg-light text-end align-middle">공정</th>
                  <td className="align-middle">
                    <div className="">
                      <Form.Select 
                        name="work_idx" 
                        value={modalForm.work_idx ?? ""} 
                        onChange={modalFormChange}
                        size="lg"
                        className="w-100"
                        style={{ minWidth: '10rem' }}
                      >
                        {(selectBox2.current || [])
                          .map(opt => (
                            <option key={opt.work_idx} value={opt.work_idx}>
                              {opt.process_name +' / '+opt.item_name}
                            </option>
                        ))}
                      </Form.Select>
                    </div>
                  </td>
                  <td className="align-middle">
                    <Button size="lg" variant="primary" onClick={getData}><i className="bi bi-search"></i></Button>
                  </td>
                  
                </tr>

              </tbody>
            </Table>
          </Col>
        </Row>
      </div>

        {/* 데스크탑 */}
      <div className="bg-light d-none d-lg-block"> 
        <Row className="h-100">
          <Col className="h-100 d-flex flex-column gap-2">
            <span className="pt-2 fw-bold fs-5">작업지시 정보</span>

            <Table bordered hover style={{ width: '100%' , fontSize:"1.4rem"}} className="m-0">
              <tbody>
                
                <tr>
                  <th className="p-4 bg-light text-end align-middle">주문번호</th>
                  <td className="align-middle">
                    <div className="">
                      <Form.Control 
                      type="text"
                      name="sales_id"
                      value={modalForm.sales_id ?? ""}
                      onChange={modalFormChange}
                      size="lg" 
                      className="w-100"
                      maxLength={50}
                      disabled={true}
                    />
                    </div>
                  </td>
                  <th className="p-4 bg-light text-end align-middle">작업지시번호</th>
                  <td className="align-middle">
                    <div className="">
                      <Form.Control 
                      type="text"
                      name="work_id"
                      value={modalForm.work_id ?? ""}
                      onChange={modalFormChange}
                      size="lg" 
                      className="w-100"
                      maxLength={50}
                      disabled={true}
                    />
                    </div>
                  </td>
                </tr>

                <tr>
                  <th className="p-4 bg-light text-end align-middle">품번</th>
                  <td className="align-middle">
                    <div className="">
                      <Form.Control 
                      type="text"
                      name="item_code"
                      value={modalForm.item_code ?? ""}
                      onChange={modalFormChange}
                      size="lg" 
                      className="w-100"
                      maxLength={50}
                      disabled={true}
                    />
                    </div>
                  </td>
                  <th className="p-4 bg-light text-end align-middle">품명</th>
                  <td colSpan={3} className="align-middle">
                    <div className="">
                      <Form.Control 
                      type="text"
                      name="item_name"
                      value={modalForm.item_name ?? ""}
                      onChange={modalFormChange}
                      size="lg" 
                      className="w-100"
                      maxLength={50}
                      disabled={true}
                    />
                    </div>
                  </td>
                </tr>

                <tr>
                  <th className="p-4 bg-light text-end align-middle">시작일자</th>
                  <td className="align-middle">
                    <div className="">
                      <Form.Control 
                      type="text"
                      name="start_date"
                      value={modalForm.start_date ?? ""}
                      onChange={modalFormChange}
                      size="lg" 
                      className="w-100"
                      maxLength={50}
                      disabled={true}
                    />
                    </div>
                  </td>
                  <th className="p-4 bg-light text-end align-middle">시작시간</th>
                  <td className="align-middle">
                    <div className="">
                      <Form.Control 
                      type="text"
                      name="start_time"
                      value={modalForm.start_time ?? ""}
                      onChange={modalFormChange}
                      size="lg" 
                      className="w-100"
                      maxLength={50}
                      disabled={true}
                    />
                    </div>
                  </td>
                  <th className="p-4 bg-light text-end align-middle">종료일자</th>
                  <td className="align-middle">
                    <div className="">
                      <Form.Control 
                      type="text"
                      name="end_date"
                      value={modalForm.end_date ?? ""}
                      onChange={modalFormChange}
                      size="lg" 
                      className="w-100"
                      maxLength={50}
                      disabled={true}
                    />
                    </div>
                  </td>
                  <th className="p-4 bg-light text-end align-middle">종료시간</th>
                  <td className="align-middle">
                    <div className="">
                      <Form.Control 
                      type="text"
                      name="end_time"
                      value={modalForm.end_time ?? ""}
                      onChange={modalFormChange}
                      size="lg" 
                      className="w-100"
                      maxLength={50}
                      disabled={true}
                    />
                    </div>
                  </td>
                </tr>


              </tbody>
            </Table>
          </Col>
        </Row>
      </div>

      {/* 데스크탑 */}
      <div className="bg-light d-none d-lg-block">
        <Row className="h-100">
          <Col className="h-100 d-flex flex-column gap-2">
            <div className="d-flex gap-2">
              <span className="pt-2 fw-bold fs-5">작업 수량</span>
             
            </div>
      
            <Table bordered hover style={{ width: '100%' , fontSize:"1.4rem"}} className="m-0">
         
              <tbody>
                <tr>
                  <th className="p-4 bg-light text-end align-middle">지시수량</th>
                  <td className="align-middle">
                    <div className="d-flex gap-2">
                      <Form.Control 
                      type="number"
                      name="order_qty"
                      value={modalForm.order_qty ?? ""}
                      onChange={modalFormChange}
                      size="lg" 
                      className="w-100"
                      maxLength={50}
                      disabled={true}
                    />
                    </div>
                  </td>
                  <th className="p-4 bg-light text-end align-middle">양품수량(ea)</th>
                  <td className="align-middle">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="number"
                        name="result_qty"
                        value={modalForm.result_qty ?? ""}
                        onChange={modalFormChange}
                        onKeyUp={((e)=>{
                          if(e.code === 'Enter'){
                            e.target.blur();
                            setQty("result_qty");
                          }
                        })}
                        size="lg" 
                        className="w-100"
                        maxLength={50}
                      />
                      <Button style={{width:"6rem", height:"4rem", fontSize:"1.4rem", fontWeight:"normal"}} variant="primary" onClick={()=>setQty("result_qty")}>적용</Button>
                      {modalForm.process_code.includes('RT1') && 
                        <Button style={{width:"4rem", height:"4rem", fontSize:"1.4rem", fontWeight:"normal"}} variant="outline-primary" onClick={getData2} disabled={sheetLoading}>
                          
                          {sheetLoading ? (
                            <>
                              <Spinner size="sm" className="" />
                            </>
                          ) : (
                            <>
                              <i className="bi bi-cloud-download"></i>
                            </>
                          )}
                        </Button>
                      }

                    </div>
                  </td>
                  <th className="p-4 bg-light text-end align-middle">불량(g)</th>
                  <td className="align-middle">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="number"
                        name="defect_qty"
                        value={modalForm.defect_qty ?? ""}
                        onChange={modalFormChange}
                        onKeyUp={((e)=>{

                          if(e.code === 'Enter'){
                            e.target.blur();
                            setQty("defect_qty");
                          }
                        })}
                        size="lg" 
                        className="w-100"
                        maxLength={50}
                      />
                      <Button style={{width:"6rem", height:"4rem", fontSize:"1.4rem", fontWeight:"normal"}} variant="primary" onClick={()=>setQty("defect_qty")}>적용</Button>

                    </div>
                  </td>
                </tr>
      
                <tr>
                  <th className="p-4 bg-light text-end align-middle">불량사유</th>
                  <td colSpan={5} className="align-middle">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="remark"
                        value={modalForm.remark ?? ""}
                        onChange={modalFormChange}
                        onKeyUp={((e)=>{
                          if(e.code === 'Enter'){
                            e.target.blur();
                            setQty("remark");
                          }
                        })}
                        size="lg" 
                        className="w-100"
                        maxLength={50}
                      />
                      <Button style={{width:"5.3rem", height:"4rem", fontSize:"1.4rem", fontWeight:"normal"}} variant="primary" onClick={()=>setQty("remark")}>적용</Button>

                    </div>
                  </td>
                  
                </tr>
              {/* </tbody>
            </Table>

          </Col>
        </Row>
      </div>
      <div className="bg-light d-none d-lg-block">
        <Row className="h-100">
          <Col className="h-100 d-flex flex-column gap-2">
            <span className="pt-2 fw-bold fs-5">작업 시간</span>

            <Table bordered hover style={{ width: '100%' , fontSize:"1.4rem"}} className="m-0">
              <tbody> */}
                <tr>
                  <th className="p-4 bg-light text-end align-middle">시작시간</th>
                  <td className="align-middle">
                    <div className="">
                      <Form.Control 
                      type="text"
                      name="start_dttm"
                      value={modalForm.start_dttm ?? ""}
                      onChange={modalFormChange}
                      size="lg" 
                      className="w-100"
                      disabled={true}
                    />
                    </div>
                  </td>
                  
                  <th className="p-4 bg-light text-end align-middle">생산시간</th>
                  <td className="align-middle">
                    <div className="">
                      <Form.Control 
                      type="text"
                      name="product_dttm"
                      value={modalForm.product_dttm ?? ""}
                      onChange={modalFormChange}
                      size="lg" 
                      className="w-100"
                      maxLength={50}
                      disabled={true}
                    />
                    </div>
                  </td>

                  <th className="p-4 bg-light text-end align-middle">종료시간</th>
                  <td className="align-middle">
                    <div className="">
                      <Form.Control 
                      type="text"
                      name="end_dttm"
                      value={modalForm.end_dttm ?? ""}
                      onChange={modalFormChange}
                      size="lg" 
                      className="w-100"
                      maxLength={50}
                      disabled={true}
                    />
                    </div>
                  </td>
                </tr>
              </tbody>
            </Table>


          </Col>
        </Row>
      </div> 


{/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
{/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
{/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}




      {/* 모바일 */}
      <div className="bg-light d-lg-none"> 
        <Row className="h-100">
          <Col className="h-100 d-flex flex-column gap-2">
            <span className="pt-2 fw-bold fs-5">작업지시 정보</span>

            <Table bordered hover style={{ width: '100%' , fontSize:"1.4rem"}} className="m-0">
              <tbody>
                
                <tr>
                  <th className="p-4 bg-light text-end align-middle">주문번호</th>
                  <td className="align-middle">
                    <div className="">
                      <Form.Control 
                      type="text"
                      name="sales_id"
                      value={modalForm.sales_id ?? ""}
                      onChange={modalFormChange}
                      size="lg" 
                      className="w-100"
                      maxLength={50}
                      disabled={true}
                    />
                    </div>
                  </td>
                </tr>

                <tr>
                  <th className="p-4 bg-light text-end align-middle">작업지시번호</th>
                  <td className="align-middle">
                    <div className="">
                      <Form.Control 
                      type="text"
                      name="work_id"
                      value={modalForm.work_id ?? ""}
                      onChange={modalFormChange}
                      size="lg" 
                      className="w-100"
                      maxLength={50}
                      disabled={true}
                    />
                    </div>
                  </td>
                </tr>

                <tr>
                  <th className="p-4 bg-light text-end align-middle">품번</th>
                  <td className="align-middle">
                    <div className="">
                      <Form.Control 
                      type="text"
                      name="item_code"
                      value={modalForm.item_code ?? ""}
                      onChange={modalFormChange}
                      size="lg" 
                      className="w-100"
                      maxLength={50}
                      disabled={true}
                    />
                    </div>
                  </td>
                </tr>

                <tr>
                  <th className="p-4 bg-light text-end align-middle">품명</th>
                  <td colSpan={3} className="align-middle">
                    <div className="">
                      <Form.Control 
                      type="text"
                      name="item_name"
                      value={modalForm.item_name ?? ""}
                      onChange={modalFormChange}
                      size="lg" 
                      className="w-100"
                      maxLength={50}
                      disabled={true}
                    />
                    </div>
                  </td>
                </tr>

                <tr>
                  <th className="p-4 bg-light text-end align-middle">시작일자</th>
                  <td className="align-middle">
                    <div className="">
                      <Form.Control 
                      type="text"
                      name="start_date"
                      value={modalForm.start_date ?? ""}
                      onChange={modalFormChange}
                      size="lg" 
                      className="w-100"
                      maxLength={50}
                      disabled={true}
                    />
                    </div>
                  </td>
                </tr>

                <tr>
                  <th className="p-4 bg-light text-end align-middle">시작시간</th>
                  <td className="align-middle">
                    <div className="">
                      <Form.Control 
                      type="text"
                      name="start_time"
                      value={modalForm.start_time ?? ""}
                      onChange={modalFormChange}
                      size="lg" 
                      className="w-100"
                      maxLength={50}
                      disabled={true}
                    />
                    </div>
                  </td>
                </tr>

                <tr>
                  <th className="p-4 bg-light text-end align-middle">종료일자</th>
                  <td className="align-middle">
                    <div className="">
                      <Form.Control 
                      type="text"
                      name="end_date"
                      value={modalForm.end_date ?? ""}
                      onChange={modalFormChange}
                      size="lg" 
                      className="w-100"
                      maxLength={50}
                      disabled={true}
                    />
                    </div>
                  </td>
                </tr>

                <tr>
                  <th className="p-4 bg-light text-end align-middle">종료시간</th>
                  <td className="align-middle">
                    <div className="">
                      <Form.Control 
                      type="text"
                      name="end_time"
                      value={modalForm.end_time ?? ""}
                      onChange={modalFormChange}
                      size="lg" 
                      className="w-100"
                      maxLength={50}
                      disabled={true}
                    />
                    </div>
                  </td>
                </tr>


              </tbody>
            </Table>
          </Col>
        </Row>
      </div>


      {/* 모바일 */}
      <div className="bg-light d-lg-none">
        <Row className="h-100">
          <Col className="h-100 d-flex flex-column gap-2">
            <div className="d-flex gap-2">
              <span className="pt-2 fw-bold fs-5">작업 수량</span>
            </div>
      
            <Table bordered hover style={{ width: '100%' , fontSize:"1.4rem"}} className="m-0">
         
              <tbody>
                <tr>
                  <th className="p-4 bg-light text-end align-middle">지시수량</th>
                  <td className="align-middle">
                    <div className="d-flex gap-2">
                      <Form.Control 
                      type="number"
                      name="order_qty"
                      value={modalForm.order_qty ?? ""}
                      onChange={modalFormChange}
                      size="lg" 
                      className="w-100"
                      maxLength={50}
                      disabled={true}
                    />
                    </div>
                  </td>
                </tr>

                <tr>
                  <th className="p-4 bg-light text-end align-middle">양품수량</th>
                  <td className="align-middle">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="number"
                        name="result_qty"
                        value={modalForm.result_qty ?? ""}
                        onChange={modalFormChange}
                        onKeyUp={((e)=>{
                          if(e.code === 'Enter'){
                            e.target.blur();
                            setQty("result_qty");
                          }
                        })}
                        size="lg" 
                        className="w-100"
                        maxLength={50}
                      />
                      <Button style={{width:"6rem", height:"4rem", fontSize:"1.4rem", fontWeight:"normal"}} variant="primary" onClick={()=>setQty("result_qty")}>적용</Button>
                      {modalForm.process_code.includes('RT1') && 
                        <Button style={{width:"4rem", height:"4rem", fontSize:"1.4rem", fontWeight:"normal"}} variant="outline-primary" onClick={getData2} disabled={sheetLoading}>
                          
                          {sheetLoading ? (
                            <>
                              <Spinner size="sm" className="" />
                            </>
                          ) : (
                            <>
                              <i className="bi bi-cloud-download"></i>
                            </>
                          )}
                        </Button>
                      }

                    </div>
                  </td>
                </tr>

                <tr>
                  <th className="p-4 bg-light text-end align-middle">불량수량</th>
                  <td className="align-middle">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="number"
                        name="defect_qty"
                        value={modalForm.defect_qty ?? ""}
                        onChange={modalFormChange}
                        onKeyUp={((e)=>{

                          if(e.code === 'Enter'){
                            e.target.blur();
                            setQty("defect_qty");
                          }
                        })}
                        size="lg" 
                        className="w-100"
                        maxLength={50}
                      />
                      <Button style={{width:"6rem", height:"4rem", fontSize:"1.4rem", fontWeight:"normal"}} variant="primary" onClick={()=>setQty("defect_qty")}>적용</Button>

                    </div>
                  </td>
                </tr>

                <tr>
                  <th className="p-4 bg-light text-end align-middle">불량사유</th>
                  <td className="align-middle">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="remark"
                        value={modalForm.remark ?? ""}
                        onChange={modalFormChange}
                        onKeyUp={((e)=>{
                          if(e.code === 'Enter'){
                            e.target.blur();
                            setQty("remark");
                          }
                        })}
                        size="lg" 
                        className="w-100"
                        maxLength={50}
                      />
                      <Button style={{width:"6rem", height:"4rem", fontSize:"1.4rem", fontWeight:"normal"}} variant="primary" onClick={()=>setQty("remark")}>적용</Button>

                    </div>
                  </td>
                  
                </tr>
              {/* </tbody>
            </Table>

          </Col>
        </Row>
      </div>   

      <div className="bg-light d-lg-none">
        <Row className="h-100">
          <Col className="h-100 d-flex flex-column gap-2">
            <span className="pt-2 fw-bold fs-5">작업 시간</span>

            <Table bordered hover style={{ width: '100%' , fontSize:"1.4rem"}} className="m-0">
              <tbody> */}
                <tr>
                  <th className="p-4 bg-light text-end align-middle">시작시간</th>
                  <td className="align-middle">
                    <div className="">
                      <Form.Control 
                      type="text"
                      name="start_dttm"
                      value={modalForm.start_dttm ?? ""}
                      onChange={modalFormChange}
                      size="lg" 
                      className="w-100"
                      maxLength={50}
                      disabled={true}
                    />
                    </div>
                  </td>
                </tr>

                <tr>
                  <th className="p-4 bg-light text-end align-middle">생산시간</th>
                  <td className="align-middle">
                    <div className="">
                      <Form.Control 
                      type="text"
                      name="product_dttm"
                      value={modalForm.product_dttm ?? ""}
                      onChange={modalFormChange}
                      size="lg" 
                      className="w-100"
                      maxLength={50}
                      disabled={true}
                    />
                    </div>
                  </td>
                </tr>

                <tr>
                  <th className="p-4 bg-light text-end align-middle">종료시간</th>
                  <td className="align-middle">
                    <div className="">
                      <Form.Control 
                      type="text"
                      name="end_dttm"
                      value={modalForm.end_dttm ?? ""}
                      onChange={modalFormChange}
                      size="lg" 
                      className="w-100"
                      maxLength={50}
                      disabled={true}
                    />
                    </div>
                  </td>
                </tr>
              </tbody>
            </Table>


          </Col>
        </Row>
      </div>      

{/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
{/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
{/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}


      <div className="h-100">
        <Row  className="h-100">
          <Col className="h-100 d-flex flex-column gap-2" xs={12} md={12}>
            
            <div className="mb-1 d-flex gap-2 justify-content-between align-items-center">
              <Button style={{width:"14rem", height:"8rem", fontSize:"2rem"}} variant={start ? "secondary" : "primary"} onClick={()=>buttonCliked("start_dttm")} disabled={start}>작업시작</Button>
              <Button style={{width:"16rem", height:"8rem", fontSize:"2rem"}} variant={pause ? "secondary" : "success"} onClick={()=>buttonCliked("pause")} disabled={pause}>{modalForm.pause === "Y" ? "일시정지 해제" : "일시정지 시작"}</Button>
              <Button style={{width:"14rem", height:"8rem", fontSize:"2rem"}} variant={modalForm.pause === 'Y' || end ? "secondary" : "danger" }onClick={()=>buttonCliked("end_dttm")} disabled={modalForm.pause === 'Y' || end}>작업종료</Button>
            </div>
          </Col>
        </Row>

      </div>

    

    </div>
  );
}

export default Main;