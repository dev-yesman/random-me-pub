// 카테고리별 이모지 매핑
export const getCategoryEmoji = (categoryName: string): string => {
  const category = categoryName.toLowerCase();
  
  // 한식
  if (category.includes('한식') || category.includes('한정식') || category.includes('백반') || 
      category.includes('국수') || category.includes('냉면') || category.includes('갈비') ||
      category.includes('삼겹살') || category.includes('불고기') || category.includes('비빔밥')) {
    return '🇰🇷';
  }
  
  // 중식
  if (category.includes('중식') || category.includes('중국') || category.includes('짜장') || 
      category.includes('짬뽕') || category.includes('탕수육') || category.includes('마라') ||
      category.includes('딤섬')) {
    return '🇨🇳';
  }
  
  // 일식
  if (category.includes('일식') || category.includes('일본') || category.includes('초밥') || 
      category.includes('라멘') || category.includes('우동') || category.includes('돈까스') ||
      category.includes('회') || category.includes('사시미') || category.includes('스시')) {
    return '🇯🇵';
  }
  
  // 양식
  if (category.includes('양식') || category.includes('이탈리안') || category.includes('파스타') || 
      category.includes('피자') || category.includes('스테이크') || category.includes('햄버거') ||
      category.includes('브런치') || category.includes('샐러드')) {
    return '🇮🇹';
  }
  
  // 치킨
  if (category.includes('치킨') || category.includes('닭') || category.includes('통닭')) {
    return '🍗';
  }
  
  // 피자
  if (category.includes('피자')) {
    return '🍕';
  }
  
  // 카페/디저트
  if (category.includes('카페') || category.includes('커피') || category.includes('디저트') || 
      category.includes('베이커리') || category.includes('빵') || category.includes('케이크') ||
      category.includes('아이스크림') || category.includes('도넛')) {
    return '☕';
  }
  
  // 술집
  if (category.includes('술집') || category.includes('호프') || category.includes('맥주') || 
      category.includes('펜션') || category.includes('호프') || category.includes('이자카야')) {
    return '🍺';
  }
  
  // 분식
  if (category.includes('분식') || category.includes('떡볶이') || category.includes('김밥') || 
      category.includes('순대') || category.includes('튀김')) {
    return '🍢';
  }
  
  // 고기/구이
  if (category.includes('고기') || category.includes('구이') || category.includes('바베큐') || 
      category.includes('bbq') || category.includes('소고기') || category.includes('돼지고기')) {
    return '🥩';
  }
  
  // 해산물
  if (category.includes('해산물') || category.includes('생선') || category.includes('조개') || 
      category.includes('회') || category.includes('낙지') || category.includes('문어') ||
      category.includes('새우') || category.includes('게')) {
    return '🦐';
  }
  
  // 면류
  if (category.includes('면') || category.includes('국수') || category.includes('라면') || 
      category.includes('우동') || category.includes('파스타') || category.includes('쌀국수')) {
    return '🍜';
  }
  
  // 패스트푸드
  if (category.includes('패스트푸드') || category.includes('햄버거') || category.includes('맥도날드') || 
      category.includes('버거킹') || category.includes('kfc') || category.includes('롯데리아')) {
    return '🍔';
  }
  
  // 기본 음식점 이모지
  return '🍽️';
};

// 카테고리 이름을 간단히 정리하는 함수
export const getSimplifiedCategory = (categoryName: string): string => {
  const parts = categoryName.split(' > ');
  
  // 첫 번째가 "음식점"이면 두 번째 카테고리를 사용
  if (parts.length >= 2 && parts[0] === '음식점') {
    return parts[1];
  }
  
  // 그 외의 경우 마지막 카테고리 사용
  return parts[parts.length - 1] || categoryName;
};