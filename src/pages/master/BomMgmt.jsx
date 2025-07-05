import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";
import { MainContentStyle } from "css/CommonStyle";

const Main = () => {

  // 모달 ref
  const modalRef = useRef();  
  const modalRef2 = useRef();  
  const modalRef3 = useRef();  

  // selectbox
  const selectBox = useRef({}); 
  
  // grid cell code_name 변환
  const categoryAFormatter = (params) => {
    const arr_client_type = selectBox.current.category?.item_group_a || [];
    const item = arr_client_type.find(el => el.category_id === params.value);
    return item ? item.category_nm : params.value; 
  };

  // grid cell code_name 변환
  const categoryBFormatter = (params) => {
    console.log(params);
    const arr_client_type = selectBox.current.category?.item_group_b[params.data.item_group_a] || [];
    const item = arr_client_type.find(el => el.category_id === params.value);
    return item ? item.category_nm : params.value; 
  };

  // grid cell code_name 변환
  const commonTypeFormatter = (params, cd) => {
    const arr_client_type = selectBox.current.common?.[cd] || [];
    const item = arr_client_type.find(el => el.code === params.value);
    return item ? item.code_name : params.value; 
  };

  // 그리드 설정 시작 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  const gridRef = useRef();  
  const [selectedRow, setSelectedRow] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  

  const col_a = [
    
    { headerName: "운영상품코드", field: "item_usr_code", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
    { headerName: "바코드", field: "bar_code", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
    { headerName: "품번", field: "item_dotno", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left", minWidth:150 },
    { headerName: "상품명", field: "item_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left", minWidth:200 },
    { headerName: "상태", field: "item_status_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
    { headerName: "소비자가", field: "sellprice", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
    { headerName: "매입공급가", field: "buyprice", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
    { headerName: "매입부가세", field: "vtax_buyprice", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
    { headerName: "매입가", field: "tax_buyprice", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
    { headerName: "과세유형", field: "tax_type_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
    { headerName: "매입유형", field: "buy_type_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
    { headerName: "기본매입처", field: "supply_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
    { headerName: "배송유형", field: "trans_type_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
    { headerName: "팩킹구분", field: "item_plus_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
    { headerName: "출고창고", field: "storage_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
    { headerName: "브랜드", field: "brand_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
    { headerName: "상품구분", field: "item_part_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
    { headerName: "등록일", field: "reg_date", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
    { headerName: "등록자", field: "reg_admin_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
  ];


  let grid_col2 = [
    { headerName: "품목코드", field: "item_dotno", sortable: false, editable: false, align:"center"},
    { headerName: "품목명", field: "item_name", sortable: false, editable: false, align:"left"}, 
    { headerName: "자재코드", field: "material_code", sortable: false, editable: false, align:"center"},
    { headerName: "자재명", field: "material_name", sortable: false, editable: false, align:"left"}, 
    { headerName: "수량", field: "quantity", sortable: false, editable: true, align:"right"}, 
    { headerName: "단위", field: "unit", sortable: false, editable: true, align:"right"},
    { headerName: "순서", field: "sort", sortable: false, editable: true, align:"center"},
    { headerName: "비고", field: "comment", sortable: false, editable: true, align:"left"}, 
  ];

  const gridRef2 = useRef();  
  const [loading2, setLoading2] = useState(false);
  const [rowData2, setRowData2] = useState([]);
  const [columnDefs2, setColumnDefs2] = useState(grid_col2);


  // 그리드 onGridReady
  const onGridReady = (params) => {
    gridRef.current = params.api; // Grid API 저장

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      console.log("rowClicked");
      console.log(ev);
      setSelectedRow(ev.rowIndex); 

      const node = ev.node;
      if (!node.isSelected()) {
        node.setSelected(true);
      }
    });

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      console.log("cellValueChanged");
      console.log(ev);
      setData(ev.data);
    });

    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      console.log(ev);
      
      const selectedRows = ev.api.getSelectedRows();
      if( ev.source !== 'rowDataChanged' && selectedRows.length > 0 ){
        getData2(selectedRows[0]);
      };

    });

  };

  // 그리드 onGridReady2
  const onGridReady2 = (params) => {
    console.log("onGridReady2");

    gridRef2.current = params.api; // Grid API 저장

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      console.log("rowClicked");
      console.log(ev);
    });

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      console.log("cellValueChanged");
      console.log(ev);
      setData(ev.data);
    });

    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      console.log(ev);
    });

  };
  
  

  

  // 그리드 설정 종료 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // 초기화
  useEffect(()=>{
    console.log("useEffect");
    
    const init = {
      category: '',
      code: ['cd006', 'cd010', 'cd011']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      selectBox.current = res.data;

      // 그리드 설정
      setColumnDefs(col_a);

      getData();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
    });  

  },[]);



  // 검색창 입력필드
  const [form, setForm] = useState({
    item_dotno:'',
    item_name:'',
  });


  // 검색창 입력필드 변경 저장
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }; 


  // 추가 모달 입력필드 저장
  const formRef = useRef();

  // 추가 모달 입력필드 변경
  const formRefChange = (name, value) => {
    formRef.current[name] = value;
  };

  // 추가 모달 기본값
  const DEFAULT_FORM = (init={}) => ({
    item_dotno:''
    , item_name:''
    , ...init
  });


  // 조회
  const getData = (params) => {
    console.log("getData");

    setRowData([]);

    setLoading(true);

    axiosInstance
    .post(`/api/getItem`, JSON.stringify(form))
    .then((res) => {
      setRowData(res.data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger" });
    })
    .finally(() =>{
      setLoading(false);

      // 그리드 행 선택
      let sel = selectedRow;
      if(typeof params === "number") sel = params;
      gridRef.current.forEachNode((node) => {
        if (node.rowIndex === sel) {
          node.setSelected(true);
        }
      });
    });
    
  };


  // 조회
  const getData2 = (params) => {
    console.log("getData2");

    setRowData2([]);
    setLoading2(true);

    axiosInstance
    .post(`/api/getBom`, JSON.stringify(params))
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
      .post("api/setBom", JSON.stringify(params))
      .then((res) => {
       
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
      });   
  };


  // 추가
  const addData = (params) => {
    console.log("addData");

    // 폼 초기화
    formRef.current = DEFAULT_FORM();

    modalRef.current.open({
      title: "BOM 추가",
      message: "추가하시겠습니까?",
      content: <ModalForm form={formRef.current} onChangeHandler={formRefChange} />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"추가",
      confirmClass:"btn btn-success",
      onConfirm: (res) => {
        
        console.log(formRef.current);
        if(!formRef.current.sel_row){
          modalRef2.current.open({ title:"알림", message:"품목을 선택하세요.", cancelText:"" });
          return;
        }

        const data = {
          item_dotno: gridRef.current.getSelectedRows()[0].item_dotno,
          material_code: formRef.current.sel_row.item_dotno
        }

        axiosInstance
          .post(`/api/addBom`, JSON.stringify(data))
          .then((res) => {
            getData();
            modalRef.current.close();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            modalRef2.current.open({ title:"알림", message:error.response.data.message, cancelText:"" });
          });   


      }, 
    });

  };


  // 삭제
  const delData = (params) => {
    console.log("delData");
    
    const sel_rows = gridRef2.current.getSelectedRows();
    
    if(sel_rows.length === 0) {
      modalRef.current.open({ title:"알림", message:"선택된 항목이 없습니다.", cancelText:"" });
      return;
    }
    
    // 모달 열기
    modalRef.current.open({
      title:"삭제",
      message:`선택된 행을 삭제하시겠습니까?`,
      confirmText:"삭제",
      confirmClass:"btn btn-danger",
      onCancel:()=>{
        modalRef.current.close();
      },
      onConfirm:(res) => {
        console.log(res);
        
        axiosInstance
          .post(`/api/delBom`, JSON.stringify(sel_rows))
          .then((res) => {
            getData();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            modalRef2.current.open({ title:"알림", message:error.response.data.message, cancelText:"" });
          })
          .finally(() =>{
            modalRef.current.close();
            setLoading(false);
          });
      },
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
                  <th className="bg-light text-end align-middle">품목</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="item_dotno"
                        value={form.item_dotno}
                        onChange={handleChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="품번"
                      />
                      <Form.Control 
                        type="text"
                        name="item_name"
                        value={form.item_name}
                        onChange={handleChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="상품명"
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
          <Col className="h-100 d-flex flex-column" xs={12} md={12}>
            <div className="mb-1 d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold">품목 목록</span>
              
            </div>

            <GridExample 
              columnDefs={columnDefs}
              rowData={rowData}
              onGridReady={onGridReady} 
              loading={loading}
              rowNum={true}
              rowSel={"singleRow"}
              pageSize={10}  
            />
          </Col>
        </Row>

      </div>

      <div className="h-100">
        <Row  className="h-100">
          <Col className="h-100 d-flex flex-column" xs={12} md={12}>
            <div className="mb-1 d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold">BOM</span>
              <Button size="sm" variant="success" onClick={addData}>추가</Button>
              <Button size="sm" variant="danger" onClick={delData}>삭제</Button>
            </div>

            <GridExample 
              columnDefs={columnDefs2}
              rowData={rowData2}
              onGridReady={onGridReady2} 
              loading={loading2}
              rowNum={true}
              rowSel={"multiRow"}
              pagination={false}
            />
          </Col>
        </Row>

      </div>
    

    </div>
  );
}

export default Main;




// 추가 모달 폼
const ModalForm = ({ form={}, onChangeHandler }) => {
  console.log("ModalForm");
  
  const modalRef = useRef();  
  const modalRef2 = useRef();  

  // selectbox
  const selectBox = useRef({}); 
  
  // grid cell code_name 변환
  const categoryAFormatter = (params) => {
    const arr_type = selectBox.current.category?.item_group_a || [];
    const item = arr_type.find(el => el.category_id === params.value);
    return item ? item.category_nm : params.value; 
  };

  // grid cell code_name 변환
  const categoryBFormatter = (params) => {
    const arr_type = selectBox.current.category?.item_group_b[params.data.item_group_a] || [];
    const item = arr_type.find(el => el.category_id === params.value);
    return item ? item.category_nm : params.value; 
  };

  // grid cell code_name 변환
  const commonTypeFormatter = (params, cd) => {
    const arr_type = selectBox.current.common?.[cd] || [];
    const item = arr_type.find(el => el.code === params.value);
    return item ? item.code_name : params.value; 
  };

  // 초기화
  useEffect(()=>{
    console.log("useEffect");
    
    const init = {
      category: '',
      code: ['cd006', 'cd010', 'cd011']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      selectBox.current = res.data;

      setColumnDefs(col_a);

      getData();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
    });  

  },[]);

  
  const [modalForm, setModalForm] = useState(form);

  const modalFormChange = (e) => {
    const { name, value } = e.target;
    setModalForm(prev => ({ ...prev, [name]: value }));
    onChangeHandler(name, value);
  };


  const gridRef = useRef();  
  const [selectedRow, setSelectedRow] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  

  const col_a = [
    
    { headerName: "품목코드", field: "item_dotno", sortable: false, editable: false, filter: "agTextColumnFilter", align:"center" },
    { headerName: "품목명", field: "item_name", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
    { headerName: "기준단위", field: "base_unit", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"center",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: selectBox.current.common?.['cd004']?.map((item) => item.code) ?? [],
      },
      valueFormatter: (params) => commonTypeFormatter(params, 'cd004'),
    },
    { headerName: "규격", field: "unit_size", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
    { headerName: "비고", field: "comment", sortable: true, editable: false, align:"left", minWidth:300},
  ];

  // 그리드 onGridReady
  const onGridReady = (params) => {
    console.log("onGridReady");

    gridRef.current = params.api; // Grid API 저장

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      console.log("rowClicked");
      console.log(ev);
      setSelectedRow(ev.rowIndex); 
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
      console.log(selectedRows);
      onChangeHandler('sel_row', selectedRows[0]);
  
    });

 
  };


  // 조회
  const getData = () => {
    console.log("getData");

    setRowData([]);
    setLoading(true);

    axiosInstance
    .post(`/api/getItem`, JSON.stringify(modalForm))
    .then((res) => {
      setRowData(res.data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger" });
    })
    .finally(() =>{
      setLoading(false);
    });
    
  };


  const delData = () => {
    const selectedNodes = gridRef.current.getSelectedNodes();
    const selectedIds = selectedNodes.map(node => node.data.process_code);
    const updatedData = rowData.filter(row => !selectedIds.includes(row.process_code));
    modalFormChange( {target:{name:"arr_proc",value:updatedData}} );
    setRowData(updatedData);
  };


  return (
    <div style={{ height: '50vh', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <div className="bg-light">
        <Row className="">
          <Col className="">

            <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  <th className="bg-light text-end align-middle">품목</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="item_dotno"
                        value={form.item_dotno}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="CODE"
                      />
                      <Form.Control 
                        type="text"
                        name="item_name"
                        value={form.item_name}
                        onChange={modalFormChange}
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
        <Col className="h-100 d-flex flex-column" xs={12} md={12}>
          <div className="mb-1 d-flex gap-2 justify-content-start align-items-center">
            <span className="fw-bold">자재 목록</span>
            
       
          </div>

          <GridExample 
            columnDefs={columnDefs}
            rowData={rowData}
            onGridReady={onGridReady} 
            loading={loading}
            rowNum={true}
            rowSel={"singleRow"}
            pagination={true}
            pageSize={10}
            // rowDrag={true}
          />
        </Col>
      </Row>

    </div>

    </div>
  );
};


