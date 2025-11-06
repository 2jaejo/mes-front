import dayjs from "dayjs";
import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "utils/Axios";


const Main = ({ info, items, items2, items3, items4, items5 }) => {
  // const mst = useRef(props.current);
  // const [info, setInfo] = useState(null);
  // const [items, setItems] = useState([]);
  
  console.log(info);
  console.log(items);
  console.log(items2);
  console.log(items3);
  console.log(items4);

  const [priceSum, setPriceSum] = useState(0);

  const tableRef = useRef(null);
  const tableRef2 = useRef(null);
  const tableRef3 = useRef(null);
  const [tableHeight, setTableHeight] = useState(0);


  const today = dayjs().format("YYYY-MM-DD");

  // 숫자를 한글 금액으로 변환
  function num2han(num) {
    num = parseInt((num + "").replace(/[^0-9]/g, ""), 10) + "";
    if (num === "0") return "영";
    const number = ["영", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
    const unit = ["", "만", "억", "조"];
    const smallUnit = ["천", "백", "십", ""];
    const result = [];
    let unitCnt = Math.ceil(num.length / 4);
    num = num.padStart(unitCnt * 4, "0");
    const array = num.match(/[\w\W]{4}/g);
    for (let i = array.length - 1, unitCnt = 0; i >= 0; i--, unitCnt++) {
      const hanValue = makeHan(array[i]);
      if (hanValue === "") continue;
      result.unshift(hanValue + unit[unitCnt]);
    }
    function makeHan(text) {
      let str = "";
      for (let i = 0; i < text.length; i++) {
        let n = text[i];
        if (n === "0") continue;
        str += number[n] + smallUnit[i];
      }
      return str;
    }
    return result.join("");
  }


  useEffect(() => {
    const total = (items || []).reduce((sum, i) => sum + i.total_price, 0);
    setPriceSum(total);
  }, [items]);
  
  useEffect(() => {
    
  }, [items2]);
  // if (!order) return <div className="p-4">로딩중...</div>;

  // {JSON.stringify(info) || ""}
  // {JSON.stringify(items) || ""}
  // {JSON.stringify(items2) || ""}
  // {JSON.stringify(items3) || ""}
  // {JSON.stringify(items4) || ""} 
  
  return (
    <div className="wrap p-4">
      <h1 className="title py-2 fw-bolder" style={{ letterSpacing:'10px', fontSize: '34px', textAlign:'center'}}>일일생산일보</h1>

       
        
      


      {/* 발주서 헤더 */}
      <table className="table table-bordered border-dark">
        <tbody>
          <tr>
            <td colSpan="4" className="text-center">
              <img src="/assets/images/logo-icon.png" alt="logo" height="50" />
            </td>
          </tr>
          
          {/* <tr>
            <th className="py-1">날짜</th>
            <td className="py-1" colSpan={3}>{today}</td>
          </tr> */}
          <tr>
            <th className="py-1">상호</th>
            <td className="py-1">(주)동일프라텍</td>
            <th className="py-1">대표자</th>
            <td className="py-1">김지현</td>
          </tr>
          <tr>
       
            <th className="py-1">사업자번호</th>
            <td className="py-1">141-81-26595</td>
            <th className="py-1">FAX</th>
            <td className="py-1">031-941-9943</td>
          </tr>
          <tr>
        
            <th className="py-1">날짜</th>
            <td className="py-1">{info}</td>
            <th className="py-1">전화</th>
            <td className="py-1">031-941-1540</td>
          </tr>
          <tr>
         
            <th className="py-1">이메일</th>
            <td className="py-1" colSpan="3">info@diang.co.kr</td>
          </tr>
          <tr>
         
            <th className="py-1" >주소</th>
            <td className="py-1" colSpan="3">
              경기도 파주시 적성면 적성단2로 16-5
            </td>
          </tr>
    
          <tr>
            <th className="py-1">업태</th>
            <td className="py-1">제조, 도매</td>
            <th className="py-1">종목</th>
            <td className="py-1">플라스틱제품</td>
          </tr>

        </tbody>
      </table>


      {/* 생산 목록 */}
      <table className="table table-bordered border-dark" ref={tableRef}>
        <thead>
          <tr>
            <th colSpan={9}>생산</th>
          </tr>
        </thead>
        <thead>
          <tr>
            <th className="py-1 text-center" style={{width:'2rem'}}>No.</th>
            <th className="py-1 text-center" style={{minWidth:'3rem'}}>공정명</th>
            <th className="py-1 text-center" style={{minWidth:'6rem'}}>제품명</th>
            <th className="py-1 text-center" style={{minWidth:'3rem'}}>작업시작</th>
            <th className="py-1 text-center" style={{minWidth:'3rem'}}>작업종료</th>
            <th className="py-1 text-center" style={{minWidth:'3rem'}}>지시수량</th>
            <th className="py-1 text-center" style={{minWidth:'3rem'}}>양품수량(ea)</th>
            <th className="py-1 text-center" style={{minWidth:'3rem'}}>불량(g)</th>
            <th className="py-1 text-center" style={{minWidth:'3rem'}}>비고</th>
          </tr>
        </thead>
        <tbody>
          {items2 && items2.map((item, idx) => (
            <tr key={idx}>
              <td className="py-1 text-center">{idx + 1}</td>
              <td className="py-1 ">{item.process_name}</td>
              <td className="py-1 text-center">{item.item_name}</td>
              <td className="py-1 text-center">{item.start_dttm}</td>
              <td className="py-1 text-end">{item.end_dttm}</td>
              <td className="py-1 text-end">{item.order_qty}</td>
              <td className="py-1 text-end">{item.result_qty}</td>
              <td className="py-1 text-end">{item.defect_qty}</td>
              <td className="py-1 text-start">{item.remark}</td>
            </tr>
          ))}

          {items2 && [...Array((Array.isArray(items2) ? items2.length : 0) < 3 ? 3 - (Array.isArray(items2) ? items2.length : 0) : 0)].map((_, idx) => (
            <tr key={items2.length + idx}>
              <td className="py-1 text-center">{items2.length + idx + 1}</td>
              <td className="py-1"></td>
              <td className="py-1"></td>
              <td className="py-1 text-end"></td>
              <td className="py-1"></td>
              <td className="py-1 text-end"></td>
              <td className="py-1 text-end"></td>
              <td className="py-1"></td>
              <td className="py-1"></td>
            </tr>
          ))}

        </tbody>
        {/* <tfoot>
          <tr>
            <td className="py-1 text-center">계</td>
            <td className="py-1 " colSpan="5"></td>
            <td className="py-1 text-end">{priceSum.toLocaleString()}</td>
            <td className="py-1 "></td>
          </tr>
        </tfoot> */}
      </table>


      {/* 완제품출고 목록 */}
      <table className="table table-bordered border-dark" ref={tableRef2}>
        <thead>
          <tr>
            <th colSpan={7}>완제품출고</th>
          </tr>
        </thead>
        <thead>
          <tr>
            <th className="py-1 text-center" style={{width:'2rem'}}>No.</th>
            <th className="py-1 text-center" style={{minWidth:'3rem'}}>바코드</th>
            <th className="py-1 text-center" style={{minWidth:'3rem'}}>제품코드</th>
            <th className="py-1 text-center" style={{minWidth:'6rem'}}>제품명</th>
            <th className="py-1 text-center" style={{minWidth:'3rem'}}>완료수량</th>
            <th className="py-1 text-center" style={{minWidth:'6rem'}}>비고</th>
          </tr>
        </thead>
        <tbody>
          {items3 && items3.map((item, idx) => (
            <tr key={idx}>
              <td className="py-1 text-center">{idx + 1}</td>
              <td className="py-1 ">{item.bar_code}</td>
              <td className="py-1 text-center">{item.item_dotno}</td>
              <td className="py-1 text-center">{item.item_name}</td>
              <td className="py-1 text-end">{item.quantity}</td>
              <td className="py-1 text-end">{item.remark}</td>
            </tr>
          ))}

          {items3 && [...Array((Array.isArray(items3) ? items3.length : 0) < 3 ? 3 - (Array.isArray(items3) ? items3.length : 0) : 0)].map((_, idx) => (
            <tr key={items3.length + idx}>
              <td className="py-1 text-center">{items3.length + idx + 1}</td>
              <td className="py-1"></td>
              <td className="py-1"></td>
              <td className="py-1 text-end"></td>
              <td className="py-1"></td>
              <td className="py-1 text-end"></td>
            </tr>
          ))}

        </tbody>
        {/* <tfoot>
          <tr>
            <td className="py-1 text-center">계</td>
            <td className="py-1 " colSpan="5"></td>
            <td className="py-1 text-end">{priceSum.toLocaleString()}</td>
            <td className="py-1 "></td>
          </tr>
        </tfoot> */}
      </table>


      {/* 자재 입/출고 목록 */}
      <table className="table table-bordered border-dark" ref={tableRef3}>
        <thead>
          <tr>
            <th colSpan={9}>자재 입/출고</th>
          </tr>
        </thead>
        <thead>
          <tr>
            <th className="py-1 text-center" style={{width:'2rem'}}>No.</th>
            <th className="py-1 text-center" style={{minWidth:'4rem'}}>변경일시</th>
            <th className="py-1 text-center" style={{minWidth:'4rem'}}>입/출고 번호</th>
            <th className="py-1 text-center" style={{minWidth:'3rem'}}>자재코드</th>
            <th className="py-1 text-center" style={{minWidth:'6rem'}}>자재명</th>
            <th className="py-1 text-center" style={{minWidth:'3rem'}}>입/출고</th>
            <th className="py-1 text-center" style={{minWidth:'3rem'}}>변경수량</th>
            <th className="py-1 text-center" style={{minWidth:'6rem'}}>비고</th>
          </tr>
        </thead>
        <tbody>
          {items4 && items4.map((item, idx) => (
            <tr key={idx}>
              <td className="py-1 text-center">{idx + 1}</td>
              <td className="py-1 ">{item.receipt_date}</td>
              <td className="py-1 text-center">{item.receipt_id}</td>
              <td className="py-1 text-center">{item.raw_code}</td>
              <td className="py-1 text-end">{item.raw_name}</td>
              <td className="py-1 text-center">{item.change_type == 'IN' ? '입고' : '출고'}</td>
              <td className="py-1 text-end">{item.changed_quantity}</td>
              <td>{item.remarks}</td>
            </tr>
          ))}

          {items4 && [...Array((Array.isArray(items4) ? items4.length : 0) < 3 ? 3 - (Array.isArray(items4) ? items4.length : 0) : 0)].map((_, idx) => (
            <tr key={items4.length + idx}>
              <td className="py-1 text-center">{items4.length + idx + 1}</td>
              <td className="py-1"></td>
              <td className="py-1"></td>
              <td className="py-1 text-end"></td>
              <td className="py-1"></td>
              <td className="py-1 text-end"></td>
              <td className="py-1 text-end"></td>
              <td className="py-1"></td>
            </tr>
          ))}

        </tbody>
        {/* <tfoot>
          <tr>
            <td className="py-1 text-center">계</td>
            <td className="py-1 " colSpan="5"></td>
            <td className="py-1 text-end">{priceSum.toLocaleString()}</td>
            <td className="py-1 "></td>
          </tr>
        </tfoot> */}
      </table>

      {/* 특이사항 */}
      <table className="table table-bordered border-dark mt-3" style={{height:'100%'}}>
        <thead>
          <tr>
            <th>특이사항</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-start h-100">
              <div style={{minHeight:40, height:'100%'}}>
                <textarea style={{width:'100%', height:'100%', border:'none', resize:'none', outline:'none'}} readOnly value={items5 || ""} />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}


export default Main;