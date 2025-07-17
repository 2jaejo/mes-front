import React, { useState, useEffect, useRef, useMemo } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";
import { MainContentStyle, MainContentStyle2 } from "css/CommonStyle";

import SearchItemComponent from "components/SearchItemComponent";
import SearchClientComponent from "components/SearchClientComponent";
import SearchUserComponent from "components/SearchUserComponent";

import dayjs from "dayjs";


const Main = ({ props={}, isActive }) => {

  // 컴포넌트로 사용했을때 ref 받기
  const [modalForm, setModalForm] = useState(props.current);
  const modalFormChange = (e) => {
    const { name, value } = e.target;
    setModalForm(prev => ({ ...prev, [name]: value }));
    if(props.current){
      props.current[name] = value;
    }
  };

  // 모달 ref
  const modalRef = useRef();  
  const modalRef2 = useRef();  
  const modalRef3 = useRef();  

  // selectbox
  const selectBox = useRef({}); 
  

  // grid cell code_name 변환
  const commonTypeFormatter = (params, cd) => {
    const arr_client_type = selectBox.current.common?.[cd] || [];
    const item = arr_client_type.find(el => el.code === params.value);
    return item ? item.code_name : params.value; 
  };

  // grid cell code_name 변환
  const moneyFormatter = (params) => {
    if (params.value == null) return '';
    const num = Number(params.value).toLocaleString('ko-KR', {maximumFractionDigits: 0});
    return num;
  };

  // 그리드 설정 시작 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // const gridRef = useRef();  
  // const selectedRow = useRef(0);
  // const [loading, setLoading] = useState(false);
  // const [rowData, setRowData] = useState([]);
  // const [columnDefs, setColumnDefs] = useState([]);
  
  const gridRef2 = useRef();  
  const selectedRow2 = useRef(0);
  const [loading2, setLoading2] = useState(false);
  const [rowData2, setRowData2] = useState([]);
  const [columnDefs2, setColumnDefs2] = useState([]);


  // // 그리드 onGridReady
  // const onGridReady = (params) => {
  //   gridRef.current = params.api; // Grid API 저장

  //   // 행 클릭 이벤트
  //   params.api.addEventListener("rowClicked", (ev) => {
  //     console.log("rowClicked");
  //     console.log(ev);
  //     selectedRow.current = ev.rowIndex; 

  //     // const node = ev.node;
  //     // if (!node.isSelected()) {
  //     //   node.setSelected(true);
  //     // }
  //   });

  //   // 셀 값 변경 이벤트
  //   params.api.addEventListener("cellValueChanged", (ev) => {
  //     console.log("cellValueChanged");
  //     console.log(ev);
  //   });

  //   // 선택 변경 이벤트
  //   params.api.addEventListener("selectionChanged", (ev) => {
  //     console.log("selectionChanged");
  //     console.log(ev);
      
  //     const selectedRows = ev.api.getSelectedRows();
  //     if( ev.source !== 'rowDataChanged' && selectedRows.length > 0 ){
  //       getData2(selectedRows[0]);
  //     };

  //   });

  // };

  // 그리드 onGridReady2
  const onGridReady2 = (params) => {
    gridRef2.current = params.api; // Grid API 저장

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      console.log("rowClicked");
      console.log(ev);
      selectedRow2.current = ev.rowIndex; 

      const node = ev.node;
      if (!node.isSelected()) {
        node.setSelected(true);
      }
    });

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      console.log("cellValueChanged");
      console.log(ev);

      // 수량 수정시 start_dttm이 비어있으면 오류
      if(ev.colDef.field === 'result_qty' || ev.colDef.field === 'defect_qty'){
        if( ev.data.start_dttm === '' || ev.data.start_dttm === null ){
          modalRef.current.open({ title:"오류", message:"작업시작을 먼저 진행해주세요.", cancelText:"" });
          return;
        }
      }

      const newData = {
        ...ev.data,
        type: ev.colDef.field,
        oldValue: ev.oldValue,
        newValue: ev.newValue,
      };

      setData(newData);
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

  // 셀 렌더러
  const ButtonRenderer = (props) => {

    const handleClick = () => {
      console.log("handleClick");

      if(props.colDef.field === 'start_dttm'){
        const newData = {
          ...props.data,
          type: props.colDef.field,
          oldValue: props.value,
          newValue: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          [props.colDef.field]: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        };
        
        setData(newData);
      }


      if(props.colDef.field === 'end_dttm' && (props.data.start_dttm === '' || props.data.start_dttm === null) ){
        modalRef.current.open({ title:"오류", message:"작업시작을 먼저 진행해주세요.", cancelText:"" });
        return;
      }
      
      if(props.colDef.field === 'end_dttm'){
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
              ...props.data,
              type: props.colDef.field,
              oldValue: props.value,
              newValue: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              [props.colDef.field]: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            };
            
            setData(newData);
            modalRef.current.close();
  
          }, 
        });
      }
      
    };

    const handleClick2 = (yn) => {
      console.log("handleClick2");
      const newData = {
        ...props.data,
        type: props.colDef.field,
        oldValue: props.value,
        newValue: yn,
        [props.colDef.field]: yn,
      };
      
      setData(newData);
    };

    let str = '';
    let bg = '';

    if (props.value === null || props.value === '') {
      if(props.colDef.field === 'start_dttm'){
        str = '작업시작';
        bg = 'primary';
      }else if(props.colDef.field === 'end_dttm'){
        str = '작업종료';
        bg = 'danger'
      } 

      return (
        <div style={{ width:'100%', display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'center' }}>
          <span>{props.value}</span>
          <Button size="sm" variant={bg} onClick={handleClick}>{str}</Button>
        </div>
      ); 
    } 
    
    let dis = false;
    let yn = '';

    if (props.colDef.field === 'pause' ) {
      if(props.data.start_dttm !== null && props.data.end_dttm === null){
        if(props.value === 'Y'){
          str = '일시정지 해제';
          bg = 'success';
          yn = 'N';
        }else if(props.value === 'N'){
          str = '일시정지 시작';
          bg = 'success';
          yn = 'Y';
        }

      }else{
        dis = true;
        str = '작업종료';
        bg = 'secondary';

      }

      return (
        <div style={{ width:'100%', display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'center' }}>
          <Button size="sm" variant={bg} onClick={()=>handleClick2(yn)} disabled={dis}>{str}</Button>
        </div>
      ); 
    }

    
    
 

    return <span>{props.value}</span>;
  };

  
  




  // 그리드 설정 종료 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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


      // 그리드 설정
      setColumnDefs2([
        { headerName: "수주번호", field: "sales_id", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"center"},
        { headerName: "작업지시코드", field: "work_id", sortable: false, editable: false, filter: "agTextColumnFilter", align:"center", width:150 },
        { headerName: "제품코드", field: "item_code", sortable: false, editable: false, filter: "agTextColumnFilter", align:"left" },
        { headerName: "제품명", field: "item_name", sortable: false, editable: false, filter: "agTextColumnFilter", align:"left", width:200 },
        { headerName: "공정코드", field: "process_code", sortable: false, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "공정명", field: "process_name", sortable: false, editable: false, filter: "agTextColumnFilter", align:"left" },
        { headerName: "지시수량", field: "order_qty", sortable: false, editable: false, align:"right", cellDataType:'number',
          valueFormatter:(params)=> moneyFormatter(params)
        },
        { headerName: "상태", field: "status", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"center",
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: selectBox.current.common?.['cd016']?.map((item) => item.code) ?? [],
          },
          valueFormatter: (params) => commonTypeFormatter(params, 'cd016'),
        },
        { headerName: "시작일자", field: "start_date", sortable: false, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "시작시간", field: "start_time", sortable: false, editable: false, align:"center",
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: selectBox.current.common?.['cd014'].map((item) => item.code) ?? [],
          },
          valueFormatter:(params)=> commonTypeFormatter(params,'cd014')
        },
        { headerName: "종료일자", field: "end_date", sortable: false, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "종료시간", field: "end_time", sortable: false, editable: false, align:"center",
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: selectBox.current.common?.['cd014'].map((item) => item.code) ?? [],
          },
          valueFormatter:(params)=> commonTypeFormatter(params,'cd014')
        },
        { headerName: "담당자", field: "worker_id", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "작업시작", field: "start_dttm", sortable: false, editable: false, align:"left", cellRenderer: ButtonRenderer},
        { headerName: "일시정지", field: "pause", sortable: false, editable: false, align:"left", cellRenderer: ButtonRenderer},
        { headerName: "작업종료", field: "end_dttm", sortable: false, editable: false, align:"left", cellRenderer: ButtonRenderer},
        { headerName: "양품수량", field: "result_qty", sortable: false, editable: true, align:"right", cellDataType:'number',
          valueFormatter:(params)=> moneyFormatter(params)
        },
        { headerName: "불량수량", field: "defect_qty", sortable: false, editable: true, align:"right", cellDataType:'number',
          valueFormatter:(params)=> moneyFormatter(params)
        },
        { headerName: "비고", field: "remark", sortable: false, editable: true, align:"left"},
        { headerName: "등록일", field: "created_at", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "등록자", field: "created_by", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "수정일", field: "updated_at", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "수정자", field: "updated_by", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
      ]);
      
      getData();

    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
    });  

  },[isActive]);



  // 검색창 입력필드
  const [form, setForm] = useState({
    start_date : ''
    , end_date : ''
    , worker_id : ''
    , item_code:''
    , item_name:''
    , client_code : ''
    , client_name : ''
    , status : ''
  });

  // 검색창 입력필드 변경 저장
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }; 



  // 조회
  // const getData = (params) => {
  //   console.log("getData");

  //   setRowData([]);
  //   setLoading(true);
  //   let result_len = 0;

  //   axiosInstance
  //   .post(`/api/getWorkOrder`, JSON.stringify(form))
  //   .then((res) => {
  //     result_len = res.data.length;
  //     setRowData(res.data);
  //   })
  //   .catch((error) => {
  //     console.error("Error fetching data:", error);
  //     modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger" });
  //   })
  //   .finally(() =>{
  //     setLoading(false);
      
  //     // 그리드 행 선택
  //     let sel = selectedRow.current;
  //     // 선택된 행이 없으면 첫번째 행 선택
  //     if(sel >= result_len) sel = 0; 
  //     if(typeof params === "number") sel = params;
  //     gridRef.current.forEachNode((node) => {
  //       if (node.rowIndex === sel) {
  //         node.setSelected(true);
  //       }
  //     });
  //   });
    
  // };


  // 조회2
  const getData = (params) => {
    console.log("getData");

    setRowData2([]);
    setLoading2(true);
    
    axiosInstance
    .post(`/api/getWorkResult`, JSON.stringify(form))
    .then((res) => {
      setRowData2(res.data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger" });
    })
    .finally(() =>{
      setLoading2(false);
    
    });
    
  };


  // 수정
  const setData = (params) => {
    console.log("setData");

    axiosInstance
      .post("api/setWorkResult", JSON.stringify(params))
      .then((res) => {
        getData();
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
      });   
  };

 

  
  return (
    <div style={MainContentStyle}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />
      <Modal ref={modalRef3} />

      <div className="bg-light">
        <Row className="">
          <Col className="">
            <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  <th className="bg-light text-end align-middle">등록일자</th>
                  <td className="">
                    <div className="d-flex gap-2 align-items-center">
                      <Form.Control 
                        type="date"
                        name="start_date"
                        value={form.start_date}
                        onChange={handleChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="CODE"
                      />
                      <span className="fw-bold"> ~ </span>
                      <Form.Control 
                        type="date"
                        name="end_date"
                        value={form.end_date}
                        onChange={handleChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="NAME"
                      />
                    </div>
                  </td>
                  {/* <th className="bg-light text-end align-middle">상태</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Select 
                        name="item_type" 
                        value={form.item_type} 
                        onChange={handleChange}
                        size="sm"
                        className="w-auto"
                        style={{minWidth:100}}
                      >
                        <option value="">전체</option>
                        {(selectBox.current.common?.['cd016'] || [])
                          .filter(opt => opt.use_yn === 'Y' )
                          .map(opt => (
                            <option key={opt.code} value={opt.code}>
                              {opt.code_name}
                            </option>
                        ))}
                      </Form.Select>               
                    </div>
                  </td> */}
{/*                   
                </tr>
              </tbody>
            </Table>
            <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr> */}
                  <th className="bg-light text-end align-middle">작업지시코드</th>
                  <td className="">
                      <Form.Control 
                        type="text"
                        name="work_id"
                        value={form.work_id}
                        onChange={handleChange}
                        size="sm" 
                        className="w-auto"
                      />
                  </td>
                
                  <th className="bg-light text-end align-middle">품목</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="item_code"
                        value={form.item_code}
                        onChange={handleChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="CODE"
                      />
                      <Form.Control 
                        type="text"
                        name="item_name"
                        value={form.item_name}
                        onChange={handleChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="NAME"
                      />
                    </div>
                  </td>
                  <td className="">
                    <Button size="sm" variant="primary" onClick={getData}><i className="bi bi-search"></i></Button>
                  </td>
                  
                </tr>
              </tbody>
            </Table>

          </Col>
        </Row>
      </div>

      <div className="h-100">
        <Row  className="h-100">
          <Col className="h-100 d-flex flex-column gap-2" xs={12} md={12}>
            {/* <div>
              <span className="py-1 fw-bold">작업지시 목록</span>
            </div>

            <GridExample 
              columnDefs={columnDefs}
              rowData={rowData}
              onGridReady={onGridReady} 
              loading={loading}
              rowNum={true}
              rowSel={"singleRow"}
              pageSize={10}
            /> */}

            <div>
              <span className="py-1 fw-bold">작업지시 목록</span>
              {/* <Button size="sm" variant="success" onClick={addData2}>추가</Button> */}
              {/* <Button size="sm" variant="danger" onClick={delData2}>삭제</Button> */}
            </div>
            <GridExample 
              columnDefs={columnDefs2}
              rowData={rowData2}
              onGridReady={onGridReady2} 
              loading={loading2}
              rowNum={true}
              rowSel={"singleRow"}
              pageSize={10}
            />
          </Col>
        </Row>


      </div>

    </div>
  );
}

export default Main;


