import { WAMLDocument } from "../dist/document.js";

const content = `
# 인용구
[[Box]]
> ## 제목
> ㅇㅇㅇㅇㅇㅇㅇㅇ
> ㅇㅇㅇㅇㅇㅇㅇㅇ
> )) 캡션

# 매체
## 제목
![alt](url)
)) 캡션 ## ))

# 표
## 제목
<table>
[ㅇ][ㅇ][ㅇ ## ))]
</table>
)) 캡션
`;
const document = new WAMLDocument(content);

console.log(document.raw);