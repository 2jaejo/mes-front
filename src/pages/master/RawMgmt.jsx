import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";
import * as XLSX from "xlsx";
import { comm } from "utils/CommonFunctions";

const Main = () => {
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
        .post(`/api/getRaw`, JSON.stringify(params))
        .then((res) => {
          setRowData(res.data);
          
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
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
    raw_code:'',
    raw_name:'',
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
    
    setColumnDefs([
      { headerName: "운영상품코드", field: "item_usr_code", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
      { headerName: "바코드", field: "bar_code", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
      { headerName: "품번", field: "raw_code", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left", minWidth:150 },
      { headerName: "품명", field: "raw_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left", minWidth:200 },
      { headerName: "단위", field: "base_unit", sortable: true, editable: true, filter: "agTextColumnFilter", align:"center" },
      { headerName: "규격", field: "unit_size", sortable: true, editable: true, filter: "agTextColumnFilter", align:"center" },
      { headerName: "매입가", field: "buyprice", sortable: true, editable: true, filter: "agTextColumnFilter", align:"center" },
      { headerName: "분류", field: "type_name", sortable: true, editable: true, filter: "agTextColumnFilter", align:"center" },
      { headerName: "상태", field: "status_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
      { headerName: "안전재고", field: "right_qty", sortable: true, editable: true, filter: "agTextColumnFilter", align:"center" },
      { headerName: "매입처", field: "supply_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
      { headerName: "등록일", field: "created_at", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
      { headerName: "등록자", field: "created_by", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
      
    ]);

    getData();


  },[]);

  // 추가 모달 기본값
  const DEFAULT_FORM = (init={}) => ({
      item_usr_code : ''
      , bar_code : ''
      , raw_code : ''
      , raw_name : ''
      , base_unit : ''
      , unit_size : ''
      , buyprice : ''
      , type_name : ''
      , status_name : ''
      , right_qty : ''
      , supply_name : ''
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
              <th className="bg-light text-end align-middle"><span className="p-0 text-danger fs-6 fw-bold">*</span>운영상품코드</th>
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
              <th className="bg-light text-end align-middle"><span className="p-0 text-danger fs-6 fw-bold">*</span>바코드</th>
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
              <th className="bg-light text-end align-middle"><span className="p-0 text-danger fs-6 fw-bold">*</span>품번</th>
              <td>
                <Form.Control 
                  type="text"
                  name="raw_code"
                  value={modalForm.raw_code ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={21}
                />
              </td>
              <th className="bg-light text-end align-middle"><span className="p-0 text-danger fs-6 fw-bold">*</span>품명</th>
              <td>
                <Form.Control 
                  type="text"
                  name="raw_name"
                  value={modalForm.raw_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={51}
                />
              </td>
            </tr>

            <tr>
              <th className="bg-light text-end align-middle">단위</th>
              <td>
                <Form.Control 
                  type="text"
                  name="base_unit"
                  value={modalForm.base_unit ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={11}
                />
              </td>
              <th className="bg-light text-end align-middle">규격</th>
              <td>
                <Form.Control 
                  type="text"
                  name="unit_size"
                  value={modalForm.unit_size ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={11}
                />
              </td>
            </tr>

            <tr>
              
              <th className="bg-light text-end align-middle">분류</th>
              <td>
                <Form.Control 
                  type="text"
                  name="type_name"
                  value={modalForm.type_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={11}
                />
              </td>
              <th className="bg-light text-end align-middle">상태</th>
              <td>
                <Form.Control 
                  type="text"
                  name="status_name"
                  value={modalForm.status_name ?? ''}
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
                  name="buyprice"
                  value={modalForm.buyprice ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={21}
                />
              </td>
              <th className="bg-light text-end align-middle">매입처</th>
              <td>
                <Form.Control 
                  type="text"
                  name="supply_name"
                  value={modalForm.supply_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={21}
                />
              </td>
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">안전재고</th>
              <td>
                <Form.Control 
                  type="text"
                  name="right_qty"
                  value={modalForm.right_qty ?? ''}
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
    , raw_code : ''
    , raw_name : ''
    , base_unit : ''
    , unit_size : ''
    , buyprice : ''
    , type_name : ''
    , status_name : ''
    , right_qty : ''
    , supply_name : ''
    , created_at : ''
    , created_by : ''
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
                  name="raw_code"
                  value={modalForm.raw_code ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
            </tr>

            <tr>
              <th className="bg-light text-end align-middle">품명</th>
              <td>
                <Form.Control 
                  type="text"
                  name="raw_name"
                  value={modalForm.raw_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
            </tr>

            <tr>
              <th className="bg-light text-end align-middle">단위</th>
              <td>
                <Form.Control 
                  type="text"
                  name="base_unit"
                  value={modalForm.base_unit ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
            </tr>
            
            <tr>
              <th className="bg-light text-end align-middle">규격</th>
              <td>
                <Form.Control 
                  type="text"
                  name="unit_size"
                  value={modalForm.unit_size ?? ''}
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
              <th className="bg-light text-end align-middle">분류</th>
              <td>
                <Form.Control 
                  type="text"
                  name="type_name"
                  value={modalForm.type_name ?? ''}
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
                  name="status_name"
                  value={modalForm.status_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">안전재고</th>
              <td>
                <Form.Control 
                  type="text"
                  name="right_qty"
                  value={modalForm.right_qty ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">매입처</th>
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
              <th className="bg-light text-end align-middle">등록일</th>
              <td>
                <Form.Control 
                  type="text"
                  name="created_at"
                  value={modalForm.created_at ?? ''}
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
                  name="created_by"
                  value={modalForm.created_by ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr>

          </tbody>
        </Table>
      </div>
    );
  };




  // 조회
  const getData = (params) => {
    console.log("getData");

    setLoading(true);

    axiosInstance
      .post(`/api/getRaw`, JSON.stringify(form))
      .then((res) => {
        setRowData(res.data);
        
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
      })
      .finally(() =>{
        setLoading(false);
      });
  };


  // 수정
  const setData = (params) => {
    console.log("setData");

    axiosInstance
      .post("api/setRaw", JSON.stringify(params))
      .then((res) => {
        
        if(res.data.length > 0){
          modalRef.current.open({ title:"알림", message:"수정되었습니다.", cancelText:"" });
        }
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
      title: "자재 추가",
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

        if(formRef.current.raw_code === "" || formRef.current.raw_code === undefined){
          modalRef2.current.open({ title:"알림", message:"품번을 입력하세요.", cancelText:"" });
          return;
        }
        
        if(formRef.current.raw_name === "" || formRef.current.raw_name === undefined){
          modalRef2.current.open({ title:"알림", message:"상품명을 입력하세요.", cancelText:"" });
          return;
        }

        axiosInstance
          .post(`/api/addRaw`, JSON.stringify(formRef.current))
          .then((res) => {
            getData();
            modalRef.current.close();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            modalRef.current.close();
            modalRef2.current.open({ title:"알림", message:error.response.data.message, cancelText:"" });
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
          .post(`/api/delRaw`, JSON.stringify(selectRows))
          .then((res) => {
            getData();
            modalRef.current.close();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            modalRef.current.close();
            modalRef2.current.open({ title:"알림", message:error.response.data.message, cancelText:"" });
          });    
 
      },
    });
    
  };


  // mapping
  const mappingData = (params) => {
    console.log("mappingData");

    let data = {category: 'raw'};

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

            axiosInstance
              .post(`/api/setExcelMapping`, JSON.stringify(reversed))
              .then((res) => {
                modalRef2.current.open({ title:"알림", message:"적용되었습니다.", cancelText:"" });
              })
              .catch((error) => {
                console.error("Error fetching data:", error);
                modalRef.current.close();
                modalRef2.current.open({ title:"알림", message:error.response.data.message, cancelText:"" });
              });   
    
          },
        });


      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.close();
        modalRef2.current.open({ title:"알림", message:error.response.data.message, cancelText:"" });
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

        let data = {category: 'raw'};
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
                tb: 'raw',
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
                  modalRef2.current.open({ title:"알림", message:error.response.data.message, cancelText:"" });
                });   


            };
    


            // 파일 읽기 시작
            reader.readAsArrayBuffer(file);


          });



 
      },
    });
    
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
      console.log(selectedRows);
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

                  <th className="bg-light text-end align-middle">품목</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="raw_code"
                        value={form.raw_code}
                        onChange={handleChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="품번"
                      />
                      <Form.Control 
                        type="text"
                        name="raw_name"
                        value={form.raw_name}
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

                  <th className="bg-light text-end align-middle">바코드</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="barcode"
                        value={form.barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        onKeyDown={handleKeyPress}
                        size="sm" 
                        className="w-auto"
                        placeholder="바코드를 스캔하세요"
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
              <Button size="sm" variant="success" onClick={addData}>추가</Button>
              <Button size="sm" variant="danger" onClick={delData}>삭제</Button>
              <Button size="sm" variant="primary" onClick={mappingData}>업로드 맵핑</Button>
              <Button size="sm" variant="primary" onClick={uploadExcel}>파일 업로드</Button>
            </div>

            <GridExample
              columnDefs={columnDefs}
              rowData={rowData}
              onGridReady={onGridReady} 
              loading={loading}
              rowNum={true}
              rowSel={"multiRow"}
              pageSize={1000}  
            />
          </Col>


        </Row>

      </div>


    </div>
  );
}

export default Main;




