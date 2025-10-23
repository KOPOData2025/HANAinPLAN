#!/usr/bin/env python3
"""
HANAinPLAN 통합 테스트 데이터 삽입 스크립트

User 서버에서 CI 발급 → 각 은행에 고객 등록 → 계좌 생성
추가로 hanainplan 서버에 업종코드/질병코드 데이터 삽입
"""

import requests
import json
import time
import random
from datetime import datetime, timedelta
from decimal import Decimal
import pymysql

# ============================================================================
# 서버 설정
# ============================================================================

USER_SERVER = "http://localhost:8084"
HANAINPLAN_SERVER = "http://localhost:8080"

BANK_CONFIGS = {
    "hana": {
        "name": "하나은행",
        "url": "http://localhost:8081",
        "api_prefix": "/api/hana"
    },
    "shinhan": {
        "name": "신한은행",
        "url": "http://localhost:8082",
        "api_prefix": "/api/shinhan"
    },
    "kookmin": {
        "name": "국민은행",
        "url": "http://localhost:8083",
        "api_prefix": "/api/kookmin"
    }
}

# ============================================================================
# 테스트 사용자 데이터 (10명)
# ============================================================================

TEST_USERS = [
    {
        "name": "주소영",
        "birthDate": "20010919",
        "gender": "F",
        "residentNumber": "0109194201214",
        "phone": "010-8965-0136"
    },
    {
        "name": "김민준",
        "birthDate": "19900315",
        "gender": "M",
        "residentNumber": "9003151234567",
        "phone": "010-1234-5001"
    },
    {
        "name": "이서연",
        "birthDate": "19950820",
        "gender": "F",
        "residentNumber": "9508202234567",
        "phone": "010-1234-5002"
    },
    {
        "name": "박지훈",
        "birthDate": "19880705",
        "gender": "M",
        "residentNumber": "8807051234567",
        "phone": "010-1234-5003"
    },
    {
        "name": "최수민",
        "birthDate": "19921201",
        "gender": "F",
        "residentNumber": "9212012234567",
        "phone": "010-1234-5004"
    },
    {
        "name": "정현우",
        "birthDate": "19850410",
        "gender": "M",
        "residentNumber": "8504101234567",
        "phone": "010-1234-5005"
    },
    {
        "name": "강지은",
        "birthDate": "19980625",
        "gender": "F",
        "residentNumber": "9806252234567",
        "phone": "010-1234-5006"
    },
    {
        "name": "조성훈",
        "birthDate": "19931118",
        "gender": "M",
        "residentNumber": "9311181234567",
        "phone": "010-1234-5007"
    },
    {
        "name": "윤아영",
        "birthDate": "19870222",
        "gender": "F",
        "residentNumber": "8702222234567",
        "phone": "010-1234-5008"
    },
    {
        "name": "임동혁",
        "birthDate": "19960908",
        "gender": "M",
        "residentNumber": "9609081234567",
        "phone": "010-1234-5009"
    },
    {
        "name": "한예린",
        "birthDate": "19940514",
        "gender": "F",
        "residentNumber": "9405142234567",
        "phone": "010-1234-5010"
    }
]

# 계좌 유형 정의
ACCOUNT_TYPES = {
    0: {"name": "통합계좌", "min_balance": 10000000, "max_balance": 200000000},
    1: {"name": "수시입출금", "min_balance": 10000000, "max_balance": 50000000},
    2: {"name": "예적금", "min_balance": 10000000, "max_balance": 100000000},
    6: {"name": "수익증권", "min_balance": 10000000, "max_balance": 50000000}
}

# 정기예금 상품 데이터
DEPOSIT_PRODUCTS = [
    {
        "deposit_code": "HANA-DEP-001",
        "name": "하나 정기예금",
        "bank_code": "HANA",
        "bank_name": "하나은행",
        "description": "하나은행 일반 정기예금 상품"
    },
    {
        "deposit_code": "KB-DEP-001",
        "name": "KB 정기예금",
        "bank_code": "KOOKMIN",
        "bank_name": "국민은행",
        "description": "국민은행 일반 정기예금 상품"
    },
    {
        "deposit_code": "SH-DEP-001",
        "name": "신한 정기예금",
        "bank_code": "SHINHAN",
        "bank_name": "신한은행",
        "description": "신한은행 일반 정기예금 상품"
    }
]

# 직업코드 샘플 데이터 (SQL INSERT 문에서 추출)
INDUSTRY_CODES = [
    ("A001", "농업", "1차산업", "중", "없음", 0.00, "벼·과수·채소·화훼 등 농작물 재배업"),
    ("A002", "축산업", "1차산업", "중", "없음", 5.00, "소·돼지·닭 등 가축사육업"),
    ("A003", "어업", "1차산업", "고", "건강검진강화", 15.00, "연근해·원양어업 및 양식업"),
    ("B001", "제조업_식품", "2차산업", "저", "없음", 0.00, "식품·음료 제조업"),
    ("B002", "제조업_섬유", "2차산업", "저", "없음", 0.00, "섬유·의류·가죽제품 제조업"),
    ("B003", "제조업_화학", "2차산업", "고", "특별건강검진", 20.00, "화학물질·의약품·플라스틱 제조업"),
    ("B004", "제조업_철강", "2차산업", "고", "건강검진강화", 15.00, "철강·비철금속 제조업"),
    ("B005", "제조업_기계", "2차산업", "중", "없음", 5.00, "일반기계·정밀기계 제조업"),
    ("B006", "제조업_전자", "2차산업", "저", "없음", 0.00, "전자부품·컴퓨터·통신장비 제조업"),
    ("B007", "제조업_자동차", "2차산업", "중", "없음", 5.00, "자동차·부품 제조업"),
    ("C001", "건설업_일반", "2차산업", "고", "건강검진강화", 20.00, "건축·토목공사업"),
    ("C002", "건설업_토목", "2차산업", "고", "건강검진강화", 25.00, "도로·교량·터널 등 토목공사"),
    ("C003", "건설업_전기", "2차산업", "고", "특별건강검진", 20.00, "전기공사·통신공사업"),
    ("D001", "도매업", "3차산업", "저", "없음", 0.00, "각종 상품의 도매거래업"),
    ("D002", "소매업", "3차산업", "저", "없음", 0.00, "백화점·마트·전문점 등 소매업"),
    ("D003", "음식점업", "3차산업", "저", "없음", 0.00, "한식·양식·중식 등 요식업"),
    ("E001", "운수업_육상", "3차산업", "중", "없음", 10.00, "버스·택시·화물차 운송업"),
    ("E002", "운수업_해상", "3차산업", "고", "건강검진강화", 20.00, "여객선·화물선 등 해상운송업"),
    ("E003", "운수업_항공", "3차산업", "고", "특별건강검진", 25.00, "항공운송 및 관련 서비스업"),
    ("F001", "통신업", "3차산업", "저", "없음", 0.00, "유선·무선통신 서비스업"),
    ("F002", "방송업", "3차산업", "저", "없음", 0.00, "TV·라디오방송 및 제작업"),
    ("F003", "정보서비스업", "3차산업", "저", "없음", 0.00, "소프트웨어 개발·데이터처리 등 IT서비스업"),
    ("G001", "금융업_은행", "3차산업", "저", "없음", 0.00, "은행·저축은행 등 금융업"),
    ("G002", "금융업_증권", "3차산업", "저", "없음", 0.00, "증권·선물·투자 관련 금융업"),
    ("G003", "금융업_보험", "3차산업", "저", "없음", 0.00, "생명보험·손해보험업"),
    ("H001", "교육서비스업", "3차산업", "저", "없음", 0.00, "학원·교습소 등 사교육업"),
    ("H002", "보건업", "3차산업", "중", "없음", 5.00, "병원·의원·보건소 등 의료업"),
    ("H003", "사회복지서비스업", "3차산업", "저", "없음", 0.00, "사회복지시설 운영 및 서비스업"),
    ("J001", "공무원_일반직", "공공부문", "저", "없음", 0.00, "중앙·지방정부 일반행정직"),
    ("J002", "공무원_경찰", "공공부문", "고", "건강검진강화", 15.00, "치안유지 및 수사업무"),
    ("J003", "공무원_소방", "공공부문", "고", "특별건강검진", 20.00, "화재진압·구조·구급업무"),
    ("J004", "공무원_군인", "공공부문", "고", "특별건강검진", 25.00, "국방업무 및 군사작전"),
    ("J005", "교사", "공공부문", "저", "없음", 0.00, "초·중·고교 및 대학 교육업")
]

# 질병코드 샘플 데이터 (SQL INSERT 문에서 추출)
DISEASE_CODES = [
    ("C80", "악성신생물", "암질환", "원발부위 불명의 악성신생물로 전이성 암을 포함", "높음", "Y", 20, 80, 90, 3, 4, "암보험", 6, "고위험질환 - 정밀검진 및 조직검사 필수"),
    ("C73", "갑상선암", "암질환", "갑상선의 악성신생물로 유두암, 여포암, 수질암, 미분화암 포함", "중간", "Y", 20, 75, 90, 3, 2, "암보험", 4, "중위험질환 - 갑상선 초음파검사 필요"),
    ("C50", "유방암", "암질환", "유방의 악성신생물로 침윤성 유관암, 소엽암 등 포함", "높음", "Y", 20, 80, 90, 5, 4, "암보험", 5, "고위험질환 - 유방촬영술 및 유전자검사 권장"),
    ("C16", "위암", "암질환", "위의 악성신생물로 선암이 대부분", "높음", "Y", 30, 80, 90, 3, 3, "암보험", 6, "고위험질환 - 위내시경 정기검진 필수"),
    ("C78", "폐암", "암질환", "폐의 악성신생물로 소세포암, 비소세포암 구분", "높음", "Y", 30, 85, 90, 3, 4, "암보험", 5, "고위험질환 - 저선량흉부CT 권장"),
    ("C22", "간암", "암질환", "간세포암 및 담관세포암 포함", "높음", "Y", 30, 80, 90, 3, 1, "암보험", 9, "고위험질환 - 간염바이러스 검사 필수"),
    ("C18", "대장암", "암질환", "결장 및 직장의 악성신생물", "높음", "Y", 30, 85, 90, 3, 3, "암보험", 7, "고위험질환 - 대장내시경 정기검진 필수"),
    ("F03", "치매", "치매", "상세불명의 치매로 알츠하이머형, 혈관성, 루이소체 치매 등 포함", "높음", "Y", 40, 90, 365, 1, 2, "간병치매보험", 10, "고위험질환 - 신경심리검사 및 뇌영상 필수"),
    ("F00", "알츠하이머병", "치매", "알츠하이머병에 의한 치매로 조기발병형(65세 이전)과 만발형 구분", "높음", "Y", 40, 90, 365, 1, 1, "간병치매보험", 4, "고위험질환 - 유전자검사 및 가족력 조사 필요"),
    ("F01", "혈관성치매", "치매", "뇌혈관질환으로 인한 치매로 다발성 뇌경색, 전략적 단일 뇌경색 등 포함", "높음", "Y", 50, 90, 365, 1, 2, "간병치매보험", 6, "고위험질환 - 뇌혈관 정밀검사 필요"),
    ("I21", "급성심근경색", "심뇌혈관질환", "ST분절상승 및 비ST분절상승 심근경색 포함", "높음", "Y", 30, 80, 30, 3, 1, "CI보험, 질병보험", 3, "고위험질환 - 심전도, 심초음파, 관상동맥CT 필요"),
    ("I64", "뇌졸중", "심뇌혈관질환", "허혈성 및 출혈성 뇌졸중 포함", "높음", "Y", 30, 85, 30, 3, 4, "CI보험, 질병보험", 7, "고위험질환 - 뇌MRI, 경동맥초음파 권장"),
    ("I62", "뇌출혈", "심뇌혈관질환", "뇌내출혈, 지주막하출혈 등 출혈성 뇌졸중", "높음", "Y", 20, 85, 30, 3, 1, "CI보험, 질병보험", 8, "고위험질환 - 뇌혈관 기형 검사 권장"),
    ("I63", "뇌경색", "심뇌혈관질환", "혈전성, 색전성, 혈역학적 뇌경색 포함", "높음", "Y", 30, 85, 30, 3, 1, "CI보험, 질병보험", 4, "고위험질환 - 경동맥 협착 정기검사 필요"),
    ("I20", "협심증", "심뇌혈관질환", "안정형 및 불안정형 협심증, 이형협심증 포함", "중간", "Y", 30, 80, 30, 2, 4, "CI보험, 질병보험", 8, "중위험질환 - 심장정밀검사 필요"),
    ("I10", "고혈압", "심뇌혈관질환", "본태성 고혈압으로 수축기 140mmHg 이상 또는 이완기 90mmHg 이상", "중간", "Y", 20, 85, 30, 2, 5, "CI보험, 질병보험", 5, "중위험질환 - 정기 혈압측정 및 심전도 필요"),
    ("E14", "당뇨병", "당뇨병", "제2형 당뇨병으로 인슐린 비의존성", "중간", "Y", 20, 85, 30, 2, 3, "질병보험, 실손의료보험", 9, "중위험질환 - 당화혈색소, 공복혈당 정기검사 필요"),
    ("E10", "인슐린의존당뇨", "당뇨병", "제1형 당뇨병으로 인슐린 절대부족", "높음", "Y", 5, 70, 30, 1, 4, "질병보험, 실손의료보험", 7, "고위험질환 - C-peptide, 자가항체 검사 필수"),
    ("K74", "간경변", "간질환", "알코올성 및 비알코올성 간경변 포함", "높음", "Y", 20, 75, 90, 2, 3, "질병보험, 실손의료보험", 3, "고위험질환 - 간기능검사, 복부CT, 내시경 필수"),
    ("K75", "간염", "간질환", "바이러스성 간염(B형, C형), 자가면역성 간염, 독성 간염 포함", "중간", "Y", 15, 80, 30, 2, 5, "질병보험, 실손의료보험", 4, "중위험질환 - 간염바이러스 검사 및 백신접종 필요"),
    ("N19", "신부전", "신장질환", "만성신부전 5단계(eGFR<15) 또는 급성신부전", "높음", "Y", 20, 85, 30, 2, 2, "질병보험, 실손의료보험", 10, "고위험질환 - 신기능검사, 신장초음파 필수"),
    ("N18", "만성신부전", "신장질환", "만성신부전 3-4단계(eGFR 15-59)", "높음", "Y", 20, 85, 30, 2, 3, "질병보험, 실손의료보험", 5, "고위험질환 - 정기적 신기능 모니터링 필요"),
    ("H25", "백내장", "안과질환", "노인성 백내장으로 수정체 혼탁으로 인한 시력저하", "낮음", "Y", 40, 95, 30, 1, 2, "질병보험, 실손의료보험", 6, "저위험질환 - 안과 세극등검사로 간단 확인"),
    ("H90", "청력손실", "이비인후과질환", "감각신경성 난청, 전음성 난청, 혼합성 난청 포함", "낮음", "Y", 15, 95, 30, 1, 3, "질병보험, 실손의료보험", 9, "저위험질환 - 순음청력검사로 객관적 평가"),
    ("M80", "골다공증", "근골격계질환", "폐경 후 골다공증 및 노인성 골다공증", "중간", "Y", 50, 90, 30, 2, 5, "질병보험, 실손의료보험", 6, "중위험질환 - 골밀도검사(DEXA) 필수"),
    ("S72", "골절", "근골격계질환", "대퇴골 경부골절, 전자간골절 등 고관절 골절 포함", "중간", "Y", 20, 95, 30, 1, 1, "질병보험, 실손의료보험", 4, "중위험질환 - X-ray, CT로 골절 확진 필요"),
    ("M79", "관절염", "근골격계질환", "퇴행성 관절염, 류마티스 관절염 포함", "낮음", "Y", 30, 90, 30, 2, 1, "질병보험, 실손의료보험", 10, "저위험질환 - 관절 X-ray, 염증수치 검사"),
    ("F32", "우울증", "정신건강질환", "주요우울장애로 PHQ-9 점수 15점 이상 또는 정신과 전문의 진단", "중간", "Y", 15, 85, 30, 1, 3, "질병보험, 실손의료보험", 5, "중위험질환 - 정신건강의학과 전문의 진단 필수"),
    ("G20", "파킨슨병", "신경계질환", "도파민 신경세포 소실로 인한 운동장애", "높음", "Y", 40, 85, 90, 3, 2, "질병보험, 실손의료보험", 7, "고위험질환 - 신경과 전문의 진단 및 DaTscan 필수"),
    ("G12.2", "루게릭병", "신경계질환", "근위축성 측삭경화증으로 운동신경세포 퇴행", "높음", "Y", 30, 80, 90, 3, 1, "질병보험, 실손의료보험", 8, "고위험질환 - 근전도검사, 신경전도검사 필수"),
    ("J44", "만성폐쇄성폐질환", "호흡기질환", "만성기관지염, 폐기종 포함", "중간", "Y", 40, 90, 30, 2, 4, "질병보험, 실손의료보험", 3, "중위험질환 - 폐기능검사, 흉부CT 필요"),
    ("Z51.1", "입원치료", "의료이용", "질병으로 인한 입원치료로 4일 이상 연속 입원 시 보장", "낮음", "Y", 15, 95, 30, 1, 5, "질병보험, 실손의료보험", 9, "저위험질환 - 입원확인서 및 진료비세부내역서로 간단 심사"),
    ("Z98.8", "수술", "의료이용", "전신마취 하 수술로 수술실에서 시행하는 모든 수술 포함", "중간", "Y", 15, 90, 30, 1, 2, "질병보험, 실손의료보험", 6, "중위험질환 - 수술동의서 및 마취기록지로 확인"),
    ("Z03.9", "진단검사", "의료이용", "질병 진단을 위한 정밀검사로 CT, MRI, 내시경, 조직검사 등 포함", "낮음", "Y", 15, 95, 30, 1, 3, "질병보험, 실손의료보험", 4, "저위험질환 - 검사결과지 및 의사소견서로 확인"),
    ("Z75.1", "장기요양", "의료이용", "장기요양등급 1-5등급 판정자 대상 장기요양서비스 이용비 보장", "중간", "Y", 40, 95, 30, 1, 1, "질병보험, 실손의료보험", 7, "중위험질환 - 장기요양등급판정서로 확인")
]

# 거래 유형 및 카테고리 정의
TRANSACTION_TYPES = ["DEPOSIT", "WITHDRAWAL", "TRANSFER", "AUTO_TRANSFER", "INTEREST", "FEE", "REFUND", "REVERSAL"]
TRANSACTION_CATEGORIES = ["SALARY", "PENSION", "SAVINGS", "INVESTMENT", "LOAN", "INSURANCE", "UTILITY", "SHOPPING", "FOOD", "TRANSPORT", "MEDICAL", "EDUCATION", "ENTERTAINMENT", "OTHER"]
TRANSACTION_DIRECTIONS = ["CREDIT", "DEBIT"]

# ============================================================================
# 통계 변수
# ============================================================================

stats = {
    "users_created": 0,
    "users_failed": 0,
    "customers_created": 0,
    "customers_failed": 0,
    "accounts_created": 0,
    "accounts_failed": 0,
    "transactions_created": 0,
    "transactions_failed": 0,
    "deposit_products_created": 0,
    "deposit_products_failed": 0,
    "industry_codes_created": 0,
    "industry_codes_failed": 0,
    "disease_codes_created": 0,
    "disease_codes_failed": 0,
    "datacode_success": False
}

# ============================================================================
# User 서버 함수
# ============================================================================

def create_user(user_data):
    """User 서버에 사용자 생성 및 CI 발급"""
    url = f"{USER_SERVER}/api/user/create"
    
    payload = {
        "name": user_data["name"],
        "birthDate": user_data["birthDate"],
        "gender": user_data["gender"],
        "residentNumber": user_data["residentNumber"],
        "phone": user_data["phone"]
    }
    
    try:
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=10)
        
        if response.status_code in [200, 201]:
            result = response.json()
            ci = result.get('ci')
            print(f"  ✅ User 생성 성공: {user_data['name']} (CI: {ci[:20]}...)")
            stats["users_created"] += 1
            return ci
        else:
            print(f"  ❌ User 생성 실패: {user_data['name']} - 상태코드: {response.status_code}")
            print(f"     응답: {response.text}")
            stats["users_failed"] += 1
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"  ❌ User 생성 오류: {user_data['name']} - {str(e)}")
        stats["users_failed"] += 1
        return None

# ============================================================================
# 은행 서버 함수
# ============================================================================

def create_bank_customer(bank_key, bank_config, user_data, ci):
    """은행에 고객 등록"""
    url = f"{bank_config['url']}{bank_config['api_prefix']}/customers"
    
    payload = {
        "ci": ci,
        "name": user_data["name"],
        "gender": user_data["gender"],
        "birthDate": user_data["birthDate"],
        "phone": user_data["phone"]
    }
    
    try:
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=10)
        
        if response.status_code in [200, 201]:
            print(f"    ✅ {bank_config['name']} 고객 등록 성공")
            stats["customers_created"] += 1
            return True
        else:
            print(f"    ❌ {bank_config['name']} 고객 등록 실패 - 상태코드: {response.status_code}")
            stats["customers_failed"] += 1
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"    ❌ {bank_config['name']} 고객 등록 오류 - {str(e)}")
        stats["customers_failed"] += 1
        return False

def create_bank_account(bank_key, bank_config, ci, account_type):
    """은행에 계좌 생성"""
    url = f"{bank_config['url']}{bank_config['api_prefix']}/accounts"
    
    # 계좌 타입별 랜덤 잔액 생성
    account_info = ACCOUNT_TYPES[account_type]
    balance = random.randint(account_info["min_balance"], account_info["max_balance"])
    
    # 계좌 개설일 (최근 1년 내 랜덤)
    days_ago = random.randint(30, 365)
    opening_date = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")
    
    payload = {
        "customerCi": ci,
        "accountType": account_type,
        "balance": balance,
        "openingDate": opening_date
    }
    
    try:
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=10)
        
        if response.status_code in [200, 201]:
            result = response.json()
            account_number = result.get('accountNumber', 'N/A')
            print(f"      ✅ {account_info['name']} 계좌 생성: {account_number} (잔액: {balance:,}원)")
            stats["accounts_created"] += 1
            return True
        else:
            print(f"      ❌ {account_info['name']} 계좌 생성 실패 - 상태코드: {response.status_code}")
            stats["accounts_failed"] += 1
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"      ❌ {account_info['name']} 계좌 생성 오류 - {str(e)}")
        stats["accounts_failed"] += 1
        return False

# ============================================================================
# 거래내역 생성 함수
# ============================================================================

def create_transaction(bank_key, bank_config, account_number, transaction_data):
    """은행 계좌에 거래내역 생성"""
    url = f"{bank_config['url']}{bank_config['api_prefix']}/accounts/transactions"
    
    try:
        response = requests.post(url, json=transaction_data, headers={"Content-Type": "application/json"}, timeout=10)
        
        if response.status_code in [200, 201]:
            result = response.json()
            transaction_id = result.get('transactionId', 'N/A')
            print(f"        ✅ 거래내역 생성: {transaction_id}")
            stats["transactions_created"] += 1
            return True
        else:
            print(f"        ❌ 거래내역 생성 실패 - 상태코드: {response.status_code}")
            print(f"           응답: {response.text}")
            stats["transactions_failed"] += 1
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"        ❌ 거래내역 생성 오류 - {str(e)}")
        stats["transactions_failed"] += 1
        return False

def generate_random_transactions(account_number, balance, count=7):
    """랜덤 거래내역 생성 (최근 30-90일)"""
    transactions = []
    current_balance = balance
    
    for i in range(count):
        # 거래일시 (최근 30-90일 내 랜덤)
        days_ago = random.randint(1, 90)
        transaction_datetime = datetime.now() - timedelta(days=days_ago)
        
        # 거래 유형 및 방향 결정
        transaction_type = random.choice(TRANSACTION_TYPES)
        transaction_category = random.choice(TRANSACTION_CATEGORIES)
        
        # 거래 방향 결정
        if transaction_type in ["DEPOSIT", "INTEREST", "REFUND"]:
            transaction_direction = "CREDIT"
        elif transaction_type in ["WITHDRAWAL", "FEE"]:
            transaction_direction = "DEBIT"
        else:
            transaction_direction = random.choice(TRANSACTION_DIRECTIONS)
        
        # 거래 금액 생성
        if transaction_direction == "CREDIT":
            # 입금: 100만원 ~ 2000만원
            amount = random.randint(1000000, 20000000)
            current_balance += amount
        else:
            # 출금: 10만원 ~ 현재 잔액의 20%
            max_withdrawal = min(current_balance * 0.2, 10000000)
            amount = random.randint(100000, int(max_withdrawal))
            current_balance -= amount
        
        # 거래 설명 생성
        descriptions = {
            "SALARY": "급여이체",
            "PENSION": "연금지급",
            "SAVINGS": "적금이체",
            "INVESTMENT": "투자금이체",
            "LOAN": "대출금이체",
            "INSURANCE": "보험료납부",
            "UTILITY": "공과금납부",
            "SHOPPING": "온라인쇼핑",
            "FOOD": "식비결제",
            "TRANSPORT": "교통비결제",
            "MEDICAL": "의료비결제",
            "EDUCATION": "교육비결제",
            "ENTERTAINMENT": "문화생활비",
            "OTHER": "기타이체"
        }
        
        description = descriptions.get(transaction_category, "기타이체")
        
        transaction_data = {
            "accountNumber": account_number,
            "transactionType": transaction_type,
            "transactionCategory": transaction_category,
            "amount": amount,
            "balanceAfter": current_balance,
            "transactionDatetime": transaction_datetime.strftime("%Y-%m-%dT%H:%M:%S"),
            "description": description,
            "transactionDirection": transaction_direction,
            "transactionStatus": "COMPLETED"
        }
        
        transactions.append(transaction_data)
    
    return transactions

# ============================================================================
# hanainplan 서버 데이터코드 삽입
# ============================================================================

def insert_hanainplan_datacodes():
    """hanainplan 서버에 업종코드/질병코드 데이터 삽입"""
    print("\n" + "=" * 80)
    print("📋 hanainplan 서버 데이터코드 삽입 중...")
    print("=" * 80)
    
    try:
        import pymysql
    except ImportError:
        print("❌ pymysql 라이브러리가 필요합니다. 설치: pip3 install pymysql")
        return False
    
    sql_file_path = "/Users/jusoyeong/Desktop/HANAinPLAN_OpenBanking/backend/hanainplan/datacode.sql"
    
    try:
        # SQL 파일 읽기
        with open(sql_file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        print(f"✅ SQL 파일 읽기 성공: {sql_file_path}")
        
        # MySQL 연결 (Docker 컨테이너 외부에서 접근)
        connection = pymysql.connect(
            host='localhost',
            port=3306,
            user='hanainplan_user',
            password='hanainplan_pass123',
            database='hanainplan_db',
            charset='utf8mb4'
        )
        
        print("✅ MySQL 연결 성공")
        
        cursor = connection.cursor()
        
        # SQL 문 실행 (세미콜론으로 분리)
        sql_statements = sql_content.split(';')
        
        for i, statement in enumerate(sql_statements):
            statement = statement.strip()
            if statement:
                try:
                    cursor.execute(statement)
                    print(f"  ✅ SQL 문 {i+1} 실행 성공")
                except Exception as e:
                    print(f"  ⚠️  SQL 문 {i+1} 실행 경고: {str(e)}")
        
        connection.commit()
        
        # 삽입 결과 확인
        cursor.execute("SELECT COUNT(*) FROM industry_code")
        industry_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM disease_code")
        disease_count = cursor.fetchone()[0]
        
        print(f"\n✅ 데이터 삽입 완료:")
        print(f"  - 업종코드: {industry_count}개")
        print(f"  - 질병코드: {disease_count}개")
        
        cursor.close()
        connection.close()
        
        stats["datacode_success"] = True
        return True
        
    except FileNotFoundError:
        print(f"❌ SQL 파일을 찾을 수 없습니다: {sql_file_path}")
        return False
    except Exception as e:
        print(f"❌ 데이터코드 삽입 오류: {str(e)}")
        return False

def insert_deposit_products():
    """hanainplan DB에 정기예금 상품 삽입"""
    print("\n" + "=" * 80)
    print("💰 정기예금 상품 삽입 중...")
    print("=" * 80)
    
    try:
        # MySQL 연결 (Docker 컨테이너 외부에서 접근)
        connection = pymysql.connect(
            host='localhost',
            port=3306,
            user='hanainplan_user',
            password='hanainplan_pass123',
            database='hanainplan_db',
            charset='utf8mb4'
        )
        
        print("✅ MySQL 연결 성공")
        
        cursor = connection.cursor()
        
        # 정기예금 상품 삽입
        for product in DEPOSIT_PRODUCTS:
            try:
                sql = """
                INSERT INTO tb_deposit_product (deposit_code, name, bank_code, bank_name, description, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                bank_name = VALUES(bank_name),
                description = VALUES(description),
                updated_at = NOW()
                """
                
                cursor.execute(sql, (
                    product["deposit_code"],
                    product["name"],
                    product["bank_code"],
                    product["bank_name"],
                    product["description"]
                ))
                
                print(f"  ✅ 정기예금 상품 삽입: {product['name']} ({product['bank_name']})")
                stats["deposit_products_created"] += 1
                
            except Exception as e:
                print(f"  ⚠️  정기예금 상품 삽입 경고: {product['name']} - {str(e)}")
                stats["deposit_products_failed"] += 1
        
        connection.commit()
        
        # 삽입 결과 확인
        cursor.execute("SELECT COUNT(*) FROM tb_deposit_product")
        product_count = cursor.fetchone()[0]
        
        print(f"\n✅ 정기예금 상품 삽입 완료: {product_count}개")
        
        cursor.close()
        connection.close()
        
        return True
        
    except Exception as e:
        print(f"❌ 정기예금 상품 삽입 오류: {str(e)}")
        return False

def insert_industry_disease_codes():
    """hanainplan DB에 직업코드/질병코드 데이터 삽입"""
    print("\n" + "=" * 80)
    print("📋 직업코드/질병코드 삽입 중...")
    print("=" * 80)
    
    try:
        # MySQL 연결 (Docker 컨테이너 외부에서 접근)
        connection = pymysql.connect(
            host='localhost',
            port=3306,
            user='hanainplan_user',
            password='hanainplan_pass123',
            database='hanainplan_db',
            charset='utf8mb4'
        )
        
        print("✅ MySQL 연결 성공")
        
        cursor = connection.cursor()
        
        # 직업코드 삽입
        for code_data in INDUSTRY_CODES:
            try:
                sql = """
                INSERT INTO industry_code (industry_code, industry_name, industry_classification, risk_level, special_conditions, premium_surcharge_rate, description)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                industry_name = VALUES(industry_name),
                industry_classification = VALUES(industry_classification),
                risk_level = VALUES(risk_level),
                special_conditions = VALUES(special_conditions),
                premium_surcharge_rate = VALUES(premium_surcharge_rate),
                description = VALUES(description)
                """
                
                cursor.execute(sql, code_data)
                stats["industry_codes_created"] += 1
                
            except Exception as e:
                print(f"  ⚠️  직업코드 삽입 경고: {code_data[0]} - {str(e)}")
                stats["industry_codes_failed"] += 1
        
        # 질병코드 삽입
        for code_data in DISEASE_CODES:
            try:
                sql = """
                INSERT INTO disease_code (disease_code, disease_name, disease_category, description, risk_level, is_insurable, min_age, max_age, waiting_period_days, renewal_cycle_years, applicable_ins_count, applicable_ins_type, insurance_comp_count, remark)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                disease_name = VALUES(disease_name),
                disease_category = VALUES(disease_category),
                description = VALUES(description),
                risk_level = VALUES(risk_level),
                is_insurable = VALUES(is_insurable),
                min_age = VALUES(min_age),
                max_age = VALUES(max_age),
                waiting_period_days = VALUES(waiting_period_days),
                renewal_cycle_years = VALUES(renewal_cycle_years),
                applicable_ins_count = VALUES(applicable_ins_count),
                applicable_ins_type = VALUES(applicable_ins_type),
                insurance_comp_count = VALUES(insurance_comp_count),
                remark = VALUES(remark)
                """
                
                cursor.execute(sql, code_data)
                stats["disease_codes_created"] += 1
                
            except Exception as e:
                print(f"  ⚠️  질병코드 삽입 경고: {code_data[0]} - {str(e)}")
                stats["disease_codes_failed"] += 1
        
        connection.commit()
        
        # 삽입 결과 확인
        cursor.execute("SELECT COUNT(*) FROM industry_code")
        industry_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM disease_code")
        disease_count = cursor.fetchone()[0]
        
        print(f"\n✅ 코드 데이터 삽입 완료:")
        print(f"  - 직업코드: {industry_count}개")
        print(f"  - 질병코드: {disease_count}개")
        
        cursor.close()
        connection.close()
        
        return True
        
    except Exception as e:
        print(f"❌ 코드 데이터 삽입 오류: {str(e)}")
        return False

# ============================================================================
# 랜덤 로직
# ============================================================================

def select_random_banks():
    """1-3개 은행을 랜덤 선택"""
    num_banks = random.randint(1, 3)
    bank_keys = list(BANK_CONFIGS.keys())
    selected = random.sample(bank_keys, num_banks)
    return selected

def generate_random_accounts():
    """각 은행당 1-3개 계좌 타입 선택"""
    num_accounts = random.randint(1, 3)
    account_types = list(ACCOUNT_TYPES.keys())
    selected = random.sample(account_types, min(num_accounts, len(account_types)))
    return selected

# ============================================================================
# 메인 실행
# ============================================================================

def main():
    """메인 실행 함수"""
    print("\n" + "=" * 80)
    print("🚀 HANAinPLAN 통합 테스트 데이터 삽입 시작")
    print("=" * 80)
    print(f"📊 생성할 사용자: {len(TEST_USERS)}명")
    print(f"🏦 은행 서버: {', '.join([config['name'] for config in BANK_CONFIGS.values()])}")
    print("=" * 80)
    
    # 1. hanainplan 서버 데이터코드 삽입
    insert_industry_disease_codes()
    
    time.sleep(2)
    
    # 2. 정기예금 상품 삽입
    insert_deposit_products()
    
    time.sleep(2)
    
    # 3. 사용자별 데이터 생성
    print("\n" + "=" * 80)
    print("👥 사용자 및 계좌 데이터 생성 중...")
    print("=" * 80)
    
    for i, user_data in enumerate(TEST_USERS, 1):
        print(f"\n[{i}/{len(TEST_USERS)}] 사용자: {user_data['name']}")
        print("-" * 80)
        
        # User 서버에 등록
        ci = create_user(user_data)
        
        if not ci:
            print(f"  ⚠️  {user_data['name']} 사용자 생성 실패 - 은행 계좌 생성 스킵")
            continue
        
        time.sleep(0.5)
        
        # 주소영 사용자는 신한/국민/하나 각 1계좌씩 생성
        if user_data['name'] == '주소영':
            selected_banks = ['shinhan', 'kookmin', 'hana']
        else:
            # 랜덤으로 1-3개 은행 선택
            selected_banks = select_random_banks()
        print(f"  🎲 선택된 은행: {', '.join([BANK_CONFIGS[bank]['name'] for bank in selected_banks])}")
        
        # 각 은행에 고객 등록 및 계좌 생성
        for bank_key in selected_banks:
            bank_config = BANK_CONFIGS[bank_key]
            
            # 고객 등록
            customer_created = create_bank_customer(bank_key, bank_config, user_data, ci)
            
            if not customer_created:
                continue
            
            time.sleep(0.3)
            
            # 주소영: 각 은행 1계좌(수시입출금: 1), 그 외 사용자는 1-3개 랜덤
            if user_data['name'] == '주소영':
                account_types = [1]
            else:
                account_types = generate_random_accounts()
            
            for account_type in account_types:
                account_created = create_bank_account(bank_key, bank_config, ci, account_type)
                if account_created:
                    # 계좌 생성 성공 시 거래내역 생성
                    time.sleep(0.5)
                    
                    # 계좌 정보 조회 (거래내역 생성을 위해)
                    try:
                        accounts_url = f"{bank_config['url']}{bank_config['api_prefix']}/accounts/ci/{ci}"
                        accounts_response = requests.get(accounts_url, timeout=10)
                        
                        if accounts_response.status_code == 200:
                            accounts = accounts_response.json()
                            if accounts:
                                # 가장 최근 생성된 계좌 선택
                                latest_account = accounts[-1]
                                account_number = latest_account.get('accountNumber')
                                balance = latest_account.get('balance', 0)
                                
                                if account_number:
                                    print(f"        💳 계좌 {account_number}에 거래내역 생성 중...")
                                    
                                    # 5-10개의 랜덤 거래내역 생성
                                    transaction_count = random.randint(5, 10)
                                    transactions = generate_random_transactions(account_number, balance, transaction_count)
                                    
                                    # 각 거래내역을 API로 생성
                                    for transaction_data in transactions:
                                        create_transaction(bank_key, bank_config, account_number, transaction_data)
                                        time.sleep(0.1)  # API 호출 간격
                                    
                                    print(f"        ✅ {transaction_count}개 거래내역 생성 완료")
                                    
                    except Exception as e:
                        print(f"        ⚠️  거래내역 생성 중 오류: {str(e)}")
                
                time.sleep(0.3)
        
        # 사용자 간 간격
        if i < len(TEST_USERS):
            time.sleep(1)
    
    # 4. 최종 통계 출력
    print("\n" + "=" * 80)
    print("📊 데이터 삽입 완료 통계")
    print("=" * 80)
    print(f"👥 사용자:")
    print(f"  - 성공: {stats['users_created']}명")
    print(f"  - 실패: {stats['users_failed']}명")
    print(f"\n🏦 은행 고객:")
    print(f"  - 성공: {stats['customers_created']}개")
    print(f"  - 실패: {stats['customers_failed']}개")
    print(f"\n💳 계좌:")
    print(f"  - 성공: {stats['accounts_created']}개")
    print(f"  - 실패: {stats['accounts_failed']}개")
    print(f"\n💸 거래내역:")
    print(f"  - 성공: {stats['transactions_created']}개")
    print(f"  - 실패: {stats['transactions_failed']}개")
    print(f"\n💰 정기예금 상품:")
    print(f"  - 성공: {stats['deposit_products_created']}개")
    print(f"  - 실패: {stats['deposit_products_failed']}개")
    print(f"\n📋 직업코드:")
    print(f"  - 성공: {stats['industry_codes_created']}개")
    print(f"  - 실패: {stats['industry_codes_failed']}개")
    print(f"\n🏥 질병코드:")
    print(f"  - 성공: {stats['disease_codes_created']}개")
    print(f"  - 실패: {stats['disease_codes_failed']}개")
    
    print("\n" + "=" * 80)
    
    if stats['users_created'] > 0 or stats['accounts_created'] > 0:
        print("✅ 데이터 삽입이 성공적으로 완료되었습니다!")
        print("\n🔍 데이터 확인 방법:")
        print(f"  User 서버: curl {USER_SERVER}/api/user/all")
        print(f"  하나은행: curl {BANK_CONFIGS['hana']['url']}{BANK_CONFIGS['hana']['api_prefix']}/customers")
        print(f"  신한은행: curl {BANK_CONFIGS['shinhan']['url']}{BANK_CONFIGS['shinhan']['api_prefix']}/customers")
        print(f"  국민은행: curl {BANK_CONFIGS['kookmin']['url']}{BANK_CONFIGS['kookmin']['api_prefix']}/customers")
        print(f"  hanainplan: curl {HANAINPLAN_SERVER}/api/industries")
        print(f"  hanainplan: curl {HANAINPLAN_SERVER}/api/diseases")
    else:
        print("⚠️  일부 데이터 삽입에 실패했습니다. 위의 오류 메시지를 확인하세요.")
    
    print("=" * 80 + "\n")

if __name__ == "__main__":
    main()

