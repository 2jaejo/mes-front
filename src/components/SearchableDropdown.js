// components/SearchableDropdown.js
import React, { useState, useEffect, useRef } from 'react';
import { Dropdown, Form } from 'react-bootstrap';

const SearchableDropdown = ({ options = [], selected, onSelect, title='선택', size="md" }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const selectedItemRef = useRef(null);



  const filteredOptions = options.filter((option) => {
    const terms = searchTerm.trim().toLowerCase().split(/\s+/); // 공백 기준 분할
    const name = option.name.toLowerCase();

    // 모든 검색어가 name 안에 포함되어 있는지 확인
    return terms.every(term => name.includes(term));
  });



  return (
    <Dropdown  className="w-100" style={{ minWidth: '200px', width: '100%' }}>

      <Dropdown.Toggle
        size={size}
        variant="outline-primary"
        className="w-100 position-relative d-flex align-items-center justify-content-start px-3"
      >
        <span className="text-truncate pe-4" style={{ maxWidth: '100%' }}>
          {selected || title}
        </span>
        <span className="position-absolute end-0 me-3 top-50 translate-middle-y">
          <i className="bi bi-caret-down-fill"></i>
        </span>
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ minWidth: '200px', width: '100%', zIndex: 9999 }}>
        <Form.Control
          autoFocus
          placeholder="검색..."
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          size={size}
        />
        <Dropdown.Divider />
        <div style={{maxHeight:'300px', overflow:'auto'}}>
          <Dropdown.Item 
            size={size} 
            key={''} 
            onClick={() => onSelect({
              bar_code:"",
              bom_cnt:"",
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
              vtax_buyprice: "",
              name:"",
              value:"",
            })
          }>
            {title}
          </Dropdown.Item>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const isSelected = option.name === selected;

              return (
                <Dropdown.Item
                  size={size}
                  key={option.value}
                  ref={isSelected ? selectedItemRef : null}
                  onClick={() => {
                    onSelect(option);
                    setMenuOpen(false);
                  }}
                  active={isSelected} // Bootstrap의 강조 클래스 적용
                >
                  {option.name}
                </Dropdown.Item>
              );
            })
          ) : (
            <Dropdown.Item size={size} disabled>결과 없음</Dropdown.Item>
          )}
        </div>

      </Dropdown.Menu>
    </Dropdown>
  );
};

export default SearchableDropdown;
