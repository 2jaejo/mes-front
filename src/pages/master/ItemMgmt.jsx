import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";
import * as XLSX from "xlsx";
import { comm } from "utils/CommonFunctions";
import dayjs from "dayjs";

const Main = ({props={} }) => {

  // 컴포넌트로 사용했을때 ref 받기
  const [modalForm, setModalForm] = useState(props.current);
  const modalFormChange = (e) => {
    const { name, value } = e.target;
    setModalForm(prev => ({ ...prev, [name]: value }));
    if(props.current){
      props.current[name] = value;
    }
  };

  const modalRef = useRef();  
  const modalRef2 = useRef();  

  const [barcode, setBarcode] = useState('');

  const handleKeyPress = async (e) => {
    if (e.key === 'Enter' && barcode.trim() !== '') {
      const params = {
        barcode: barcode,
      }

      setLoading(true);
      axiosInstance
        .post(`/api/getItem`, JSON.stringify(params))
        .then((res) => {
          setRowData(res.data);
          
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
        })
        .finally(() =>{
          setLoading(false);
          setBarcode('');

        });
      
    }

  };

  // selectbox
  const selectBox = useRef({}); 

  // 검색창 입력필드
  const [form, setForm] = useState({
    item_type:'',
    use_yn: '',
    item_dotno:'',
    item_name:'',

  });

  // 검색창 입력필드 변경 저장
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }; 


  // 추가모달 품목분류1 값 저장
  const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    }, [value]);
    return ref.current;
  };

  const prevGroup = usePrevious(form.item_group_a);

  // 추가모달 품목분류1 변경 감지
  useEffect(()=>{
    console.log("useEffect2");
    if (prevGroup !== form.item_group_a) {
      setForm(prev => ({
        ...prev,
        item_group_b: ''
      }));
    }
  },[form.item_group_a, prevGroup]);


  // grid cell code_name 변환
  const categoryAFormatter = (params) => {
    const arr_client_type = selectBox.current.category?.item_group_a || [];
    const item = arr_client_type.find(el => el.category_id === params.value);
    return item ? item.category_nm : params.value; 
  };

  // grid cell code_name 변환
  const categoryBFormatter = (params) => {
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


  
  // 그리드 설정
  const gridRef = useRef();  
  const [rowData, setRowData] = useState();
  const [columnDefs, setColumnDefs] = useState([]);
  const [loading, setLoading] = useState(false);
  


  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  // 초기화 selectbox list
  useEffect(()=>{
    console.log("useEffect");
    
    const init = {
      category: '',
      code: ['cd004', 'cd005', 'cd006', 'cd015']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
        selectBox.current = res.data;

        setColumnDefs([
          // { headerName: "운영상품코드", field: "item_id", sortable: false, editable: false, filter: "agTextColumnFilter", align:"center" },
          // { headerName: "바코드", field: "barcode", sortable: false, editable: false, filter: "agTextColumnFilter", align:"center" },
          // { headerName: "품목코드", field: "item_code", sortable: false, editable: false, filter: "agTextColumnFilter", align:"center", width:200, },
          // { headerName: "품목명", field: "item_name", sortable: true, editable: true, filter: "agTextColumnFilter",  align:"left", width:300,},
          // { headerName: "품목유형", field: "item_type", sortable: true, editable: true, align:"center", width:100,
          //   cellEditor: "agSelectCellEditor",
          //   cellEditorParams: {
          //     values: selectBox.current.common?.['cd006'].map((item) => item.code) ?? [],
          //   },
          //   valueFormatter: (params) => commonTypeFormatter(params, 'cd006'),
          // },
          // { headerName: "상태", field: "item_status", sortable: true, editable: true, align:"center", width:100,
          //   cellEditor: "agSelectCellEditor",
          //   cellEditorParams: {
          //     values: selectBox.current.common?.['cd015'].map((item) => item.code) ?? [],
          //   },
          //   valueFormatter: (params) => commonTypeFormatter(params, 'cd015'),
          // },
          // { headerName: "기준단위", field: "base_unit", sortable: true, editable: true, filter: "agTextColumnFilter",  align:"center",
          //   cellEditor: "agSelectCellEditor",
          //   cellEditorParams: {
          //     values: selectBox.current.common?.['cd004'].map((item) => item.code) ?? [],
          //   },
          //   valueFormatter: (params) => commonTypeFormatter(params, 'cd004'),
          // },
          // { headerName: "입고검사", field: "incoming_inspection", sortable: true, editable: true, align:"center", maxWidth:100,
          //   backgroundColor: "#a7d1ff29",
          //   cellRenderer: 'agCheckboxCellRenderer',
          //   cellRendererParams: {
          //     disabled: false,
          //   },
          //    // Y/N 값을 true/false로 변환하여 체크박스 표시
          //   valueGetter: (params) => {
          //     return params.data.incoming_inspection === 'Y';
          //   },
      
          //   // 체크박스 변경 시 true/false → Y/N 으로 반영
          //   valueSetter: (params) => {
          //     const newValue = params.newValue ? 'Y' : 'N';
          //     if (params.data.incoming_inspection !== newValue) {
          //       params.data.incoming_inspection = newValue;
          //       return true; // 값이 바뀐 경우만 true
          //     }
          //     return false; // 변경 없음
          //   },
          // },
          // { headerName: "출하검사", field: "outgoing_inspection", sortable: false, editable: true, align:"center", maxWidth:80,
          //   backgroundColor: "#a7d1ff29",
          //   cellRenderer: 'agCheckboxCellRenderer',
          //   cellRendererParams: {
          //     disabled: false,
          //   },
          //    // Y/N 값을 true/false로 변환하여 체크박스 표시
          //   valueGetter: (params) => {
          //     return params.data.outgoing_inspection === 'Y';
          //   },
      
          //   // 체크박스 변경 시 true/false → Y/N 으로 반영
          //   valueSetter: (params) => {
          //     const newValue = params.newValue ? 'Y' : 'N';
          //     if (params.data.outgoing_inspection !== newValue) {
          //       params.data.outgoing_inspection = newValue;
          //       return true; // 값이 바뀐 경우만 true
          //     }
          //     return false; // 변경 없음
          //   },
          // },
          // { headerName: "검사방법", field: "inspection_method", sortable: true, editable: true, align:"center",
          //   cellEditor: "agSelectCellEditor",
          //   cellEditorParams: {
          //     values: selectBox.current.common?.['cd005'].map((item) => item.code) ?? [],
          //   },
          //   valueFormatter: (params) => commonTypeFormatter(params, 'cd005'),
          // },
          // { 
          //   headerName: "사용여부", field: "use_yn", sortable: true, editable: false, align:"center", maxWidth:100,
          //   backgroundColor: "#a7d1ff29",
          //   cellRenderer: 'agCheckboxCellRenderer',
          //   cellRendererParams: {
          //     disabled: false,
          //   },
          //   // Y/N 값을 true/false로 변환하여 체크박스 표시
          //   valueGetter: (params) => {
          //     return params.data.use_yn === 'Y';
          //   },
          //   // 체크박스 변경 시 true/false → Y/N 으로 반영
          //   valueSetter: (params) => {
          //     const newValue = params.newValue ? 'Y' : 'N';
          //     if (params.data.use_yn !== newValue) {
          //       params.data.use_yn = newValue;
          //       return true; // 값이 바뀐 경우만 true
          //     }
          //     return false; // 변경 없음
          //   },
          // },
          
          { headerName: "운영상품코드", field: "item_usr_code", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
          { headerName: "바코드", field: "bar_code", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
          { headerName: "품번", field: "item_dotno", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left", minWidth:100 },
          { headerName: "상품명", field: "item_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left", minWidth:300 },
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
          { headerName: "등록일", field: "reg_date", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center", cellDataType: 'dateString' },
          { headerName: "등록자", field: "reg_admin_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },

          // { headerName: "비고", field: "comment", sortable: true, editable: true, align:"left", flex:1},
        ]);

        getData();

      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
      });  

  },[]);



  // 추가 모달 기본값
  const DEFAULT_FORM = (init={}) => ({
      item_usr_code : ''
    , bar_code : ''
    , item_dotno : ''
    , item_name : ''
    , item_status_name : ''
    , sellprice : ''
    , buyprice : ''
    , vtax_buyprice : ''
    , tax_buyprice : ''
    , tax_type_name : ''
    , buy_type_name : ''
    , supply_name : ''
    , trans_type_name : ''
    , item_plus_name : ''
    , storage_name : ''
    , brand_name : ''
    , item_part_name : ''
    , category : ''
    , ...init
  });

  // 추가 모달 입력필드 저장
  const formRef = useRef();

  // 추가 모달 입력필드 변경
  const formRefChange = (name, value) => {
    formRef.current[name] = value;
  };

  // 추가 모달 컴포넌트
  const ModalForm = ({ form={}, onChangeHandler }) => {
    console.log("ModalForm");

    const [modalForm, setModalForm] = useState(form);

    const modalFormChange = (e) => {
      const { name, value } = e.target;
      setModalForm(prev => ({ ...prev, [name]: value }));
      onChangeHandler(name, value);
    };

    return (
      <div className="p-2" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
          <tbody>
            <tr>
              <th className="bg-light text-end align-middle">운영상품코드</th>
              <td>
                <Form.Control 
                  type="text"
                  name="item_usr_code"
                  value={modalForm.item_usr_code ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={21}
                />
              </td>
              <th className="bg-light text-end align-middle">바코드</th>
              <td>
                <Form.Control 
                  type="text"
                  name="bar_code"
                  value={modalForm.bar_code ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={21}
                />
              </td>
            </tr>

            <tr>
              <th className="bg-light text-end align-middle">품번</th>
              <td>
                <Form.Control 
                  type="text"
                  name="item_dotno"
                  value={modalForm.item_dotno ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={21}
                />
              </td>
              <th className="bg-light text-end align-middle">상품명</th>
              <td>
                <Form.Control 
                  type="text"
                  name="item_name"
                  value={modalForm.item_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={51}
                />
              </td>
            </tr>

            <tr>
              <th className="bg-light text-end align-middle">상태</th>
              <td>
                <Form.Control 
                  type="text"
                  name="item_status_name"
                  value={modalForm.item_status_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={11}
                />
              </td>
              <th className="bg-light text-end align-middle">소비자가</th>
              <td>
                <Form.Control 
                  type="text"
                  name="sellprice"
                  value={modalForm.sellprice ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={11}
                />
              </td>
            </tr>

            <tr>
              <th className="bg-light text-end align-middle">매입공급가</th>
              <td>
                <Form.Control 
                  type="text"
                  name="buyprice"
                  value={modalForm.buyprice ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={11}
                />
              </td>
              <th className="bg-light text-end align-middle">매입부가세</th>
              <td>
                <Form.Control 
                  type="text"
                  name="vtax_buyprice"
                  value={modalForm.vtax_buyprice ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={11}
                />
              </td>
            </tr>
   
            <tr>
              <th className="bg-light text-end align-middle">매입가</th>
              <td>
                <Form.Control 
                  type="text"
                  name="tax_buyprice"
                  value={modalForm.tax_buyprice ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={11}
                />
              </td>
              <th className="bg-light text-end align-middle">과세유형</th>
              <td>
                <Form.Control 
                  type="text"
                  name="tax_type_name"
                  value={modalForm.tax_type_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={11}
                />
              </td>
              
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">매입유형</th>
              <td>
                <Form.Control 
                  type="text"
                  name="buy_type_name"
                  value={modalForm.buy_type_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={11}
                />
              </td>
              <th className="bg-light text-end align-middle">기본매입처</th>
              <td>
                <Form.Control 
                  type="text"
                  name="supply_name"
                  value={modalForm.supply_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={11}
                />
              </td>
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">배송유형</th>
              <td>
                <Form.Control 
                  type="text"
                  name="trans_type_name"
                  value={modalForm.trans_type_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={11}
                />
              </td>
              <th className="bg-light text-end align-middle">팩킹구분</th>
              <td>
                <Form.Control 
                  type="text"
                  name="item_plus_name"
                  value={modalForm.item_plus_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={11}
                />
              </td>
              
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">출고창고</th>
              <td>
                <Form.Control 
                  type="text"
                  name="storage_name"
                  value={modalForm.storage_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={11}
                />
              </td>
              <th className="bg-light text-end align-middle">브랜드</th>
              <td>
                <Form.Control 
                  type="text"
                  name="brand_name"
                  value={modalForm.brand_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={11}
                />
              </td>
              
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">상품구분</th>
              <td>
                <Form.Control 
                  type="text"
                  name="item_part_name"
                  value={modalForm.item_part_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={11}
                />
              </td>
              
              
            </tr>
           
            

          </tbody>
        </Table>
      </div>
    );
  };

  // 추가 모달 기본값
  const DEFAULT_FORM2 = (init={}) => ({
      data : ''
    , comment : ''
    , ...init
  });

  // 추가 모달 입력필드 저장
  const formRef2 = useRef();

  // 추가 모달 입력필드 변경
  const formRefChange2 = (name, value) => {
    formRef2.current[name] = value;
  };

  // 추가 모달 컴포넌트
  const ModalForm2 = ({ form={}, onChangeHandler }) => {
    console.log("ModalForm2");

    const [modalForm, setModalForm] = useState(form);

    const modalFormChange = (e) => {
      const { name, value, files } = e.target;
      setModalForm(prev => ({ ...prev, [name]: value }));
      if( files && files.length > 0 ) {
        onChangeHandler(name, files[0]);
      } else {
        onChangeHandler(name, value);
      }
    };

    return (
      <div className={"p-2"}>
        <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
          <tbody>
            <tr>
              <th className="bg-light text-end align-middle">파일첨부</th>
              <td colSpan={3}>
                <Form.Control
                  type="file"
                  name="data"
                  value={modalForm.data ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-100"
                  accept=".xlsx, .xls"
                />
              </td>
              
            </tr>
          </tbody>
        </Table>
      </div>
    );
  };


  // 추가 모달 기본값
  const DEFAULT_FORM3 = (init={}) => ({
    item_usr_code : ''
    , bar_code : ''
    , item_dotno : ''
    , item_name : ''
    , item_status_name : ''
    , sellprice : ''
    , buyprice : ''
    , vtax_buyprice : ''
    , tax_buyprice : ''
    , tax_type_name : ''
    , buy_type_name : ''
    , supply_name : ''
    , trans_type_name : ''
    , item_plus_name : ''
    , storage_name : ''
    , brand_name : ''
    , item_part_name : ''
    // , reg_date : ''
    // , reg_admin_name : ''
    , category : ''
    , ...init
  });

  // 추가 모달 입력필드 저장
  const formRef3 = useRef();

  // 추가 모달 입력필드 변경
  const formRefChange3 = (name, value) => {
    formRef3.current[name] = value;
  };

  // 추가 모달 컴포넌트
  const ModalForm3 = ({ form={}, onChangeHandler }) => {
    console.log("ModalForm3");

    const [modalForm, setModalForm] = useState(form);

    const modalFormChange = (e) => {
      const { name, value, files } = e.target;

      // 영어면 대문자, 영어 외면 빈 문자열
      const isEnglish = /^[a-zA-Z]$/.test(value);
      const cleanedValue = isEnglish ? value.toUpperCase() : '';

      setModalForm(prev => ({ ...prev, [name]: cleanedValue }));
      if( files && files.length > 0 ) {
        onChangeHandler(name, files[0]);
      } else {
        onChangeHandler(name, cleanedValue);
      }
    };

    return (
      <div className="p-2" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
          <tbody>
            <tr>
              <th className="bg-light text-end align-middle">운영상품코드</th>
              <td>
                <Form.Control 
                  type="text"
                  name="item_usr_code"
                  value={modalForm.item_usr_code ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
            </tr>

            <tr>
              <th className="bg-light text-end align-middle">바코드</th>
              <td>
                <Form.Control 
                  type="text"
                  name="bar_code"
                  value={modalForm.bar_code ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
            </tr>

            <tr>
              <th className="bg-light text-end align-middle">품번</th>
              <td>
                <Form.Control 
                  type="text"
                  name="item_dotno"
                  value={modalForm.item_dotno ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
            </tr>

            <tr>
              <th className="bg-light text-end align-middle">상품명</th>
              <td>
                <Form.Control 
                  type="text"
                  name="item_name"
                  value={modalForm.item_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
            </tr>

            <tr>
              <th className="bg-light text-end align-middle">상태</th>
              <td>
                <Form.Control 
                  type="text"
                  name="item_status_name"
                  value={modalForm.item_status_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
            </tr>
            
            <tr>
              <th className="bg-light text-end align-middle">소비자가</th>
              <td>
                <Form.Control 
                  type="text"
                  name="sellprice"
                  value={modalForm.sellprice ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">매입공급가</th>
              <td>
                <Form.Control 
                  type="text"
                  name="buyprice"
                  value={modalForm.buyprice ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">매입부가세</th>
              <td>
                <Form.Control 
                  type="text"
                  name="vtax_buyprice"
                  value={modalForm.vtax_buyprice ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">매입가</th>
              <td>
                <Form.Control 
                  type="text"
                  name="tax_buyprice"
                  value={modalForm.tax_buyprice ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">과세유형</th>
              <td>
                <Form.Control 
                  type="text"
                  name="tax_type_name"
                  value={modalForm.tax_type_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">매입유형</th>
              <td>
                <Form.Control 
                  type="text"
                  name="buy_type_name"
                  value={modalForm.buy_type_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">기본매입처</th>
              <td>
                <Form.Control 
                  type="text"
                  name="supply_name"
                  value={modalForm.supply_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">배송유형</th>
              <td>
                <Form.Control 
                  type="text"
                  name="trans_type_name"
                  value={modalForm.trans_type_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">팩킹구분</th>
              <td>
                <Form.Control 
                  type="text"
                  name="item_plus_name"
                  value={modalForm.item_plus_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">출고창고</th>
              <td>
                <Form.Control 
                  type="text"
                  name="storage_name"
                  value={modalForm.storage_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">브랜드</th>
              <td>
                <Form.Control 
                  type="text"
                  name="brand_name"
                  value={modalForm.brand_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">상품구분</th>
              <td>
                <Form.Control 
                  type="text"
                  name="item_part_name"
                  value={modalForm.item_part_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr>
            {/* <tr>
              <th className="bg-light text-end align-middle">등록일</th>
              <td>
                <Form.Control 
                  type="text"
                  name="reg_date"
                  value={modalForm.reg_date ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">등록자</th>
              <td>
                <Form.Control 
                  type="text"
                  name="reg_admin_name"
                  value={modalForm.reg_admin_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr> */}
            

          </tbody>
        </Table>
      </div>
    );
  };




  // 조회
  // const getData = (params) => {
  //   console.log("getData");

  //   setLoading(true);

  //   axiosInstance
  //     .post(`/api/getOsmStockItemStorageList`, JSON.stringify({}))
  //     .then((res) => {
  //       setRowData(res.data);
        
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching data:", error);
  //       modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
  //     })
  //     .finally(() =>{
  //       setLoading(false);
  //     });
  // };

  // 조회
  const getData = (params) => {
    console.log("getData");

    setLoading(true);

    axiosInstance
      .post(`/api/getItem`, JSON.stringify(form))
      .then((res) => {
        setRowData(res.data);
        
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
      })
      .finally(() =>{
        setLoading(false);
      });
  };


  // 수정
  const setData = (params) => {
    console.log("setData");

    axiosInstance
      .post("api/setItem", JSON.stringify(params))
      .then((res) => {
        
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
      });   
  };


  // 추가
  const addData = (params) => {
    console.log("addData");

    // 폼 초기화
    formRef.current = DEFAULT_FORM();

    modalRef.current.open({
      title: "품목 추가",
      message: "추가하시겠습니까?",
      content: <ModalForm form={formRef.current} onChangeHandler={formRefChange} />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"추가",
      confirmClass:"btn btn-success",
      onConfirm: (res) => {

        if(formRef.current.item_usr_code === "" || formRef.current.item_usr_code === undefined){
          modalRef2.current.open({ title:"알림", message:"운영상품코드를 입력하세요.", cancelText:"" });
          return;
        }
        
        if(formRef.current.bar_code === "" || formRef.current.bar_code === undefined){
          modalRef2.current.open({ title:"알림", message:"바코드를 입력하세요.", cancelText:"" });
          return;
        }

        if(formRef.current.item_dotno === "" || formRef.current.item_dotno === undefined){
          modalRef2.current.open({ title:"알림", message:"품목품번 입력하세요.", cancelText:"" });
          return;
        }
        
        if(formRef.current.item_name === ""){
          modalRef2.current.open({ title:"알림", message:"상품명을 입력하세요.", cancelText:"" });
          return;
        }

        modalRef.current.update({ isLoading: true });
        axiosInstance
          .post(`/api/addItem`, JSON.stringify(formRef.current))
          .then((res) => {
            getData();
            modalRef.current.close();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            modalRef.current.close();
            modalRef2.current.open({ title:"알림", message:error.message, cancelText:"" });
          })
          .finally(() => {
            modalRef.current.update({ isLoading: false });
          });

        

        
      }, 
    });

  };


  // 삭제
  const delData = (params) => {
    console.log("delData");
    
    const selectRows = gridRef.current.getSelectedRows();
    
    if(selectRows.length === 0) {
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
        
        axiosInstance
          .post(`/api/delItem`, JSON.stringify(selectRows))
          .then((res) => {
            getData();
            modalRef.current.close();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            modalRef.current.close();
            modalRef2.current.open({ title:"알림", message:error.message, cancelText:"" });
          });    
 
      },
    });
    
  };


  // mapping
  const mappingData = (params) => {
    console.log("mappingData");

    let data = {category: 'item'};

    axiosInstance
      .post(`/api/excelMapping`, JSON.stringify(data))
      .then((res) => {
        
        const mappingData = res.data;

        if(mappingData.length === 0) {
          modalRef2.current.open({ title:"알림", message:"엑셀 매핑 정보가 없습니다.", cancelText:"" });
          return;
        }
        
        const reversed = Object.fromEntries(
          Object.entries(mappingData)
          .filter(([k, v]) => v && v.trim?.()) // category, null, undefined, '', '  ' 제거
          .map(([k, v]) => [v.trim(), k])
        );


        // 폼 초기화
        formRef3.current = DEFAULT_FORM3(reversed);

        // 모달 열기
        modalRef.current.open({
          title:"맵핑",
          confirmText:"적용",
          confirmClass:"btn btn-primary",
          content: <ModalForm3 form={formRef3.current} onChangeHandler={formRefChange3} />,
          onCancel:()=>{
            modalRef.current.close();
          },
          onConfirm:(res) => {

            const reversed = Object.fromEntries(
              Object.entries(formRef3.current)
              .filter(([k, v]) => v && v.trim?.()) // category, null, undefined, '', '  ' 제거
              .map(([k, v]) => [v.trim(), k])
            );

            modalRef.current.update({ isLoading: true });

            axiosInstance
              .post(`/api/setExcelMapping`, JSON.stringify(reversed))
              .then((res) => {
                modalRef2.current.open({ title:"알림", message:"적용되었습니다.", cancelText:"" });
              })
              .catch((error) => {
                console.error("Error fetching data:", error);
                modalRef.current.close();
                modalRef2.current.open({ title:"알림", message:error.message, cancelText:"" });
              })
              .finally(() => {
                modalRef.current.update({ isLoading: false });
              });

          },
        });


      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.close();
        modalRef2.current.open({ title:"알림", message:error.message, cancelText:"" });
      });    
    
    
    
  };


  // excel 업로드
  const uploadExcel = (params) => {
    console.log("uploadExcel");




    // 폼 초기화
    formRef2.current = DEFAULT_FORM2({
      data: ''
    });
    
    // 모달 열기
    modalRef.current.open({
      title:"파일 업로드",
      confirmText:"적용",
      confirmClass:"btn btn-primary",
      content: <ModalForm2 form={formRef2.current} onChangeHandler={formRefChange2} />,
      onCancel:()=>{
        modalRef.current.close();
      },
      onConfirm:(res) => {

        const file = formRef2.current.data;
        if (!file) {
          modalRef2.current.open({ title:"알림", message:"엑셀 파일을 선택하세요.", cancelText:"" });
          return;
        }


        let data = {category: 'item'};
        modalRef.current.update({ isLoading: true });
        
        axiosInstance
          .post(`/api/excelMapping`, JSON.stringify(data))
          .then((res) => {

            const { category, ...mappingData } = res.data;

            if(mappingData.length === 0) {
              modalRef2.current.open({ title:"알림", message:"엑셀 매핑 정보가 없습니다.", cancelText:"" });
              return;
            }

            // 엑셀 파일 읽기
            const reader = new FileReader();
            reader.onload = (evt) => {
              const binaryStr = evt.target.result;
    
              // 워크북 파싱
              const workbook = XLSX.read(binaryStr, { type: "binary" });
    
              // 첫 번째 시트 가져오기
              const firstSheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[firstSheetName];
    
              // 시트 데이터를 JSON으로 변환
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 'A' });
              jsonData.shift(); // 첫 번째 행(헤더) 제거

              // console.log(jsonData);
              
              // 헤더 직접 지정
              const mappedData = jsonData.map(row => {
                const newRow = {};
                for (const key in row) {
                  const mappedKey = mappingData[key];
                  if (typeof mappedKey === 'string' && mappedKey.trim() !== '') {
                    newRow[comm.camelToSnake(mappedKey)] = row[key];
                  }
                  // else는 아무 처리도 안 해서 해당 키-값은 제외됨
                }
                return newRow;
              });

              // console.log(mappedData);

              // return;

              const data = {
                tb: 'item',
                items: mappedData
              };
       
              axiosInstance
                .post(`/api/addExcelMapping`, JSON.stringify(data))
                .then((res) => {
                  modalRef2.current.open({ title:"알림", message:"적용되었습니다.", cancelText:"" });
                  modalRef.current.close();
                  getData(); // 데이터 새로고침
                })
                .catch((error) => {
                  console.error("Error fetching data:", error);
                  modalRef.current.close();
                  modalRef2.current.open({ title:"알림", message:error.message, cancelText:"" });
                })
                .finally(() => {
                  modalRef.current.update({ isLoading: false });
                });


            };
    


            // 파일 읽기 시작
            reader.readAsArrayBuffer(file);


          });



 
      },
    });
    
  };

  const exportExcel = () =>{
    console.log("exportExcel");
    if (gridRef.current) {
      gridRef.current.exportDataAsCsv({
        fileName: `export_${dayjs().format('YYYYMMDD')}_동일프라텍__품목관리.csv`
      });
    }
  };



  // 그리드 onGridReady
  const onGridReady = (params) => {
    gridRef.current = params.api; // Grid API 저장

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      
    });

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      console.log("cellValueChanged");
      
      setData(ev.data);
    });

    
    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      

      const selectedRows = params.api.getSelectedRows();
      modalFormChange({target:{name:'sel_row', value:selectedRows}});
      // props.current['sel_row'] = selectedRows;
    });

  };

  
  return (
    <div style={{ height: '87vh', display: 'flex', flexDirection: 'column' }}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <div className="mb-2 bg-light">
        <Row className="">
          <Col className="">
            <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  {/* <th className="bg-light text-end align-middle">품목유형</th>
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
                        {(selectBox.current.common?.['cd006'] || [])
                          .filter(opt => opt.use_yn === 'Y')
                          .map(opt => (
                            <option key={opt.code} value={opt.code}>
                              {opt.code_name}
                            </option>
                        ))}
                      </Form.Select>               
                    </div>
                  </td>
                  
                  <th className="bg-light text-end align-middle">사용여부</th>
                  <td className="">
                    
                    <Form.Select 
                      name="use_yn" 
                      value={form.use_yn} 
                      onChange={handleChange}
                      size="sm"
                      className="w-auto"
                      style={{minWidth:100}}
                    >
                      <option value="">전체</option>
                      <option value="y">사용</option>
                      <option value="n">미사용</option>
                    </Form.Select>
                  </td> */}

                  <th className="bg-light text-end align-middle">품목</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="item_dotno"
                        value={form.item_dotno}
                        onChange={handleChange}
                        onKeyUp={(e)=>{if(e.code === 'Enter') getData()}}
                        size="sm" 
                        className="w-auto"
                        placeholder="품번"
                        maxLength={50}
                      />
                      <Form.Control 
                        type="text"
                        name="item_name"
                        value={form.item_name}
                        onChange={handleChange}
                        onKeyUp={(e)=>{if(e.code === 'Enter') getData()}}
                        size="sm" 
                        className="w-auto"
                        placeholder="상품명"
                        maxLength={50}
                      />
                    </div>
                  </td>
                  <td className="">
                    <Button size="sm" variant="primary" onClick={getData}><i className="bi bi-search"></i></Button>
                  </td>

                  <th className="bg-light text-end align-middle">바코드</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="barcode"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        onKeyUp={handleKeyPress}
                        size="sm" 
                        className="w-auto"
                        placeholder="바코드를 스캔하세요"
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
            <div className="d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold my-2">품목 리스트</span>
              { !(props?.current) &&
                <>
                  <Button size="sm" variant="success" onClick={addData}>추가</Button>
                  <Button size="sm" variant="danger" onClick={delData}>삭제</Button>
                  <Button size="sm" variant="primary" onClick={mappingData}>업로드 맵핑</Button>
                  <Button size="sm" variant="primary" onClick={uploadExcel}>파일 업로드</Button>
                  <Button size="sm" variant="success" onClick={exportExcel}>csv 다운로드</Button>
                </>
              }
            </div>

            <GridExample
              columnDefs={columnDefs}
              rowData={rowData}
              onGridReady={onGridReady} 
              loading={loading}
              rowNum={true}
              rowSel={props?.current ? "multiRow" : "singleRow"}
              pageSize={1000}  
            />
          </Col>


        </Row>

      </div>


    </div>
  );
}

export default Main;




