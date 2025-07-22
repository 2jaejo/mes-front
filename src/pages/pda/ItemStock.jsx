
import { useState, useRef, useEffect } from "react"
import { Container, Card, Form, Button, Row, Col, ListGroup, Badge, Modal, Alert, Spinner } from "react-bootstrap"
import axiosInstance from "utils/Axios";
import CustomModal from "components/Modal";


const ItemStock = ({ form }) => {
  const modalRef = useRef();  
  const modalRef2 = useRef();
  
  const formRef = useRef();
  const formRef2 = useRef();

  const DEFAULT_FORM = (init={})=> ({
    bar_code:"",
    brand_name:"",
    buy_type_name:"",
    buyprice:"",
    idx:"",
    item_dotno:"",
    item_name:"",
    item_part_name:"",
    item_plus_name:"",
    item_status_name:"",
    item_usr_code:"",
    reg_admin_name:"",
    reg_date:"",
    sellprice:"",
    storage_name:"",
    supply_name:"",
    tax_buyprice:"",
    tax_type_name:"",
    trans_type_name:"",
    vtax_buyprice:"",
    quantity:"",
    remark:"",
    ...init
  });

  // 폼 데이터 상태
  const [formData, setFormData] = useState(DEFAULT_FORM());



  // 폼 데이터 변경 핸들러
  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if(name === 'purchase_id'){
      setFormData((prev) => ({
        ...prev,
        ['client_code']: '',
        ['client_name']: '',
      }));
    }
  }


  // 품목 데이터 상태
  const [items, setItems] = useState([])
  const [selectedItems, setSelectedItems] = useState([])

  // 모달 상태
  const [showClientModal, setShowClientModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)


  // 로딩 상태
  const [loading, setLoading] = useState(false)


  const [barcode, setBarcode] = useState('');
  const [today, setToday] = useState(new Date().toISOString().split("T")[0]);

  const handleKeyPress = async (e) => {
    if (e.key === 'Enter' && barcode.trim() !== '') {
      getData();
    }

  };



  useEffect(()=>{
    console.log("useEffect");
    getData2();
  },[]);


  const getData = async () =>{
    if(barcode === ''){
      modalRef.current.open({ title:"알림", message:"바코드를 입력하세요.", cancelText:"" });
      return;
    }

    const params = {
      barcode: barcode,
    }

    axiosInstance
      .post(`/api/getItem`, JSON.stringify(params))
      .then((res) => {
        // setRowData(res.data);
        
        if( res.data.length === 1 ){
          setFormData((prev) => ({
            ...res.data[0]
          }));
          // handleItemAdd(res.data[0]);          
        }
        else{
          modalRef.current.open({ title:"알림", message:"유효하지 않은 바코드입니다.", cancelText:"" });
        }


      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
      })
      .finally(() =>{
        setBarcode('');

      });
  };

  const getData2 = async () =>{
    console.log("getData2");

    axiosInstance
      .post(`/api/getProductionLog`, JSON.stringify({today:today}))
      .then((res) => {
        
        setItems(res.data);
        
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
      })
      .finally(() =>{

      });
  };



  

  // 저장 처리
  const handleSave = () => {
    // 유효성 검사
    if (!formData.item_dotno) {
      modalRef.current.open({ title:"알림", message:"제품정보를 입력해주세요.", cancelText:"" });
      return
    }

    if (!formData.quantity) {
      modalRef.current.open({ title:"알림", message:"생산량을 입력해주세요.", cancelText:"" });
      return
    }

    modalRef.current.open({
      title: "저장",
      content: "저장하시겠습니까?",
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"저장",
      confirmClass:"btn btn-primary",
      onConfirm: (res) => {

        const newData = {
          ...formData,
          today
        };
        console.log(newData);

        modalRef.current.close();
        setLoading(true);

        axiosInstance
          .post(`/api/addProductionLog`, JSON.stringify(newData))
          .then((res) => {
            modalRef2.current.open({ title:"알림", message:"생산완료 처리 되었습니다.", cancelText:"", autoCloseDelay: 2000 });
            resetForm();
            getData2();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            modalRef2.current.open({ title:"알림", message:error.message, cancelText:"" });
          })
          .finally(()=>{
            setLoading(false);

          });
          
      }, 
    });

  }


  // 폼 초기화
  const resetForm = () => {
    setFormData(DEFAULT_FORM());
  }



  // 금액 포맷터
  const formatMoney = (amount) => {
    if (!amount) return "0"
    return Number(amount).toLocaleString("ko-KR")
  }

  // 품목 수량/단가 변경
  const handleItemChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value

    // 합계 자동 계산
    if (field === "quantity" || field === "unit_price") {
      const quantity = Number(newItems[index].quantity) || 0
      const unitPrice = Number(newItems[index].unit_price) || 0
      newItems[index].total_price = quantity * unitPrice
    }

    setItems(newItems)
  }

  // 품목 선택/해제
  const toggleItemSelection = (index) => {
    setSelectedItems((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index)
      } else {
        return [...prev, index]
      }
    })
  }

  // 전체 선택/해제
  const toggleAllSelection = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(items.map((_, index) => index))
    }
  }

  return (
    <Container fluid className="p-0" style={{ minHeight: "87vh"}}>

      <CustomModal ref={modalRef} />
      <CustomModal ref={modalRef2} />


      {/* 바코드 */}
      <Card className="mb-3 shadow-sm">
        {/* <Card.Header className="bg-primary text-white">
          <h6 className="mb-0">
            <i className="bi bi-clipboard-data me-2"></i>
            입고 정보
          </h6>
        </Card.Header> */}

        <Card.Body>
          
          {/* Barcode Scanner */}
          <div className="d-flex gap-2">
              
            <Form.Control 
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              name="barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={handleKeyPress}
              size="md" 
              className="w-100"
              placeholder="제품 바코드를 스캔하세요"
              maxLength={21}
            />
      
            <Button variant="primary" onClick={getData}>
              <i className="bi bi-search"></i>
            </Button>
          </div>

        </Card.Body>
      </Card>

      {/* 기본 정보 카드 */}
      <Card className="shadow-sm">
        {/* <Card.Header className="bg-primary text-white">
          <h6 className="mb-0">
            <i className="bi bi-clipboard-data me-2"></i>
            입고 정보
          </h6>
        </Card.Header> */}

        <Card.Body>
          {/* 발주번호 */}
          <div className="mb-2">
            <Form.Label className=" mb-0 fw-bold">바코드</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                name="bar_code"
                value={formData.bar_code ?? ""}
                onChange={handleFormChange}
                placeholder=""
                maxLength={50}
                disabled
              />
              {/* <Button variant="primary" onClick={handleOrderSearch}>
                <i className="bi bi-search"></i>
              </Button> */}
            </div>
          </div>

          {/* 거래처 */}
          <div className="mb-2">
            <Form.Label className=" mb-0 fw-bold">품번</Form.Label>
            <div className="d-flex gap-2 mb-2">
              <Form.Control
                type="text"
                name="itme_dotno"
                value={formData.item_dotno ?? ""}
                placeholder=""
                maxLength={50}
                disabled
              />
            </div>
            <div className="d-flex gap-2">
              {/* <Button variant="primary" onClick={handleClientSearch}>
                <i className="bi bi-search"></i>
              </Button>
              <Button variant="secondary" onClick={resetForm2}>
                <i className="bi bi-arrow-clockwise"></i>
              </Button> */}
            </div>
          </div>

          <div className="mb-2">
            <Form.Label className=" mb-0 fw-bold">품명</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control 
                type="text" 
                name="item_name" 
                value={formData.item_name ?? ""} 
                placeholder="" 
                maxLength={50}
                disabled 
              />
            </div>
          </div>

          {/* 입고일 */}
          <div className="mb-2">
            <Form.Label className=" mb-0 fw-bold">생산량</Form.Label>
            <Form.Control 
              type="number" 
              name="quantity" 
              value={formData.quantity ?? ""} 
              onChange={handleFormChange} 
              maxLength={50}
            />
          </div>

          {/* 비고 */}
          <div>
            <Form.Label className=" mb-0 fw-bold">비고</Form.Label>
            <Form.Control
              type="text"
              name="remark"
              value={formData.remark ?? ""}
              onChange={handleFormChange}
              placeholder=""
              maxLength={200}
            />
          </div>
        </Card.Body>
      </Card>


      {/* 하단 고정 버튼 */}
      <div className="bg-white border-top p-3" style={{ zIndex: 1030 }}>
        <Row className="g-2">
          <Col xs={6}>
            <Button variant="outline-secondary" size="lg" className="w-100" onClick={resetForm}>
              <i className="bi bi-arrow-clockwise me-1"></i>
              초기화
            </Button>
          </Col>
          <Col xs={6}>
            <Button variant="primary" size="lg" className="w-100" onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="me-1" />
                  저장중...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-1"></i>
                  저장
                </>
              )}
            </Button>
          </Col>
        </Row>
      </div>


      {/* 목록 카드 */}
      <Card className="mt-3 shadow-sm">
        <Card.Header className="">
          <div className="d-flex gap-2 justify-content-between align-items-center">
            <Button variant="secondary" size="sm" onClick={getData2}>
              <i className="bi bi-arrow-clockwise"></i>
            </Button>

            <Form.Control
              type="date"
              name="today"
              value={today ?? ""}
              onChange={handleFormChange}
              placeholder=""
              maxLength={100}
              size="sm"
              className="w-auto"
              disabled
            />
            <div className="d-flex gap-2">
              <h6 className="mb-0">
                완료 목록 ({items.length}개)
              </h6>
              {/* <Button size="sm" variant="danger" onClick={deleteSelectedItems}>
                삭제 ({selectedItems.length})
              </Button> */}
              
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {items.length === 0 ? (
            <div className="text-center py-5 text-muted">
              {/* <i className="bi bi-inbox" style={{ fontSize: "3rem" }}></i> */}
              <p className="mt-3 mb-3">등록된 품목이 없습니다.</p>
              
            </div>
          ) : (
            <>
              {/* 전체 선택 */}
              {/* <div className="p-2 border-bottom bg-light">
                <Form.Check
                  type="checkbox"
                  id="select_all"
                  checked={selectedItems.length === items.length && items.length > 0}
                  onChange={toggleAllSelection}
                  className="ms-2 fw-bold fs-6 form-check d-flex gap-2 align-items-center"
                  label={`전체 선택 (${selectedItems.length}/${items.length})`}
                />
              </div> */}

              {/* 품목 리스트 */}
              <ListGroup variant="flush" className="p-2 d-flex flex-column gap-2">
                {items.map((item, index) => (
                  <ListGroup.Item key={index} className="p-2 border-2 rounded-3">
                    <div className="mb-3">
                      <div className="d-flex align-items-center">
                        
                        <h6 className="mb-1">{item.item_name}</h6>
                      </div>
                      <div>
                        <span className="text-muted">품번: {item.item_dotno}</span>
                      </div>
                      <div>
                        <span className="text-muted">바코드: {item.bar_code}</span>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-start">
                    </div>

                    <Row className="g-2">
                      <Col xs={4}>
                        <Form.Label className="fw-bold">완료수량</Form.Label>
                        <Form.Control
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          placeholder="수량"
                          size="sm"
                          className="w-auto"
                          maxLength={50}
                          disabled
                        />
                      </Col>
                     
                    </Row>

                    
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>
          )}
        </Card.Body>
      </Card>

      
    </Container>
  )
}

export default ItemStock



