const fs = require("fs");
const path = require("path");

const files = [
  "assets/CourseMappings-BYJZi49Z-CTSFz2GD-CwzFEC29-C-BSTXZY-C4dUxByn-C3ikOWdW-CtkaDSF0.js",
  "dist/assets/CourseMappings-BYJZi49Z-CTSFz2GD-CwzFEC29-C-BSTXZY-C4dUxByn-C3ikOWdW-CtkaDSF0.js",
];

for (const relPath of files) {
  const filePath = path.join(__dirname, relPath);
  if (!fs.existsSync(filePath)) { console.log("SKIP (not found):", relPath); continue; }

  let code = fs.readFileSync(filePath, "utf8");

  // 1. Add editMapModal state after mapForm state
  const stateTarget = `,[N,w]=o.useState({ourCourseName:"",externalCourseName:"",genioCourseId:"",genioSpecializationId:""})`;
  const stateReplace = stateTarget + `,[$e,O2]=o.useState(null)`;
  if (!code.includes(stateTarget)) { console.error("FAIL step1 stateTarget not found in", relPath); continue; }
  code = code.replace(stateTarget, stateReplace);

  // 2. Add updateMapping (ue) and openEditMapping (pe) after openEditBranch (le)
  const fnTarget = `le=r=>{v({name:r.name,genioBranchId:String(r.genioBranchId||"")}),G(r)}`;
  const fnReplace = fnTarget + `,ue=()=>u(this,null,function*(){if(!$e)return;const r=yield fetch(\`\${h}/course-mappings/\${$e.id}\`,{method:"PATCH",headers:m(),body:JSON.stringify(N)});const a=yield r.json();if(!r.ok){i("err",a.error||"Error");return}i("ok","Course mapping updated"),O2(null),$()}),pe=r=>{w({ourCourseName:r.ourCourseName,externalCourseName:r.externalCourseName,genioCourseId:String(r.genioCourseId||""),genioSpecializationId:String(r.genioSpecializationId||"")}),O2(r)}`;
  if (!code.includes(fnTarget)) { console.error("FAIL step2 fnTarget not found in", relPath); continue; }
  code = code.replace(fnTarget, fnReplace);

  // 3. Replace table row action td (single delete button → flex div with edit + delete)
  const tdTarget = `e.jsx("td",{className:"px-4 py-3",children:e.jsx("button",{onClick:()=>ne(r),className:"p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors",children:e.jsx("svg",{className:"w-4 h-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeWidth:"2",strokeLinecap:"round",d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"})})})})`;
  const tdReplace = `e.jsx("td",{className:"px-4 py-3",children:e.jsxs("div",{className:"flex gap-1",children:[e.jsx("button",{onClick:()=>pe(r),className:"p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors",children:e.jsx("svg",{className:"w-4 h-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeWidth:"2",strokeLinecap:"round",d:"M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"})})}),e.jsx("button",{onClick:()=>ne(r),className:"p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors",children:e.jsx("svg",{className:"w-4 h-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeWidth:"2",strokeLinecap:"round",d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"})})})]})})`
  if (!code.includes(tdTarget)) { console.error("FAIL step3 tdTarget not found in", relPath); continue; }
  code = code.replace(tdTarget, tdReplace);

  // 4. Add edit mapping modal after add mapping modal
  // Find the end of the add mapping modal (last modal in JSX)
  const modalTarget = `X&&e.jsxs(D,{title:\`Add Course Mapping`;
  const modalEnd = findModalEnd(code, code.indexOf(modalTarget));
  if (modalEnd === -1) { console.error("FAIL step4 cannot find add mapping modal end in", relPath); continue; }

  const editModal = `,$e&&e.jsxs(D,{title:\`Edit Mapping \u2014 \${$e.ourCourseName}\`,onClose:()=>O2(null),children:[e.jsx(x,{label:"Our Course Name (RAV) *",value:N.ourCourseName,onChange:r=>w(a=>({...a,ourCourseName:r})),placeholder:"e.g. M.Sc. in Integrative Nutrition & Dietetics"}),e.jsx(x,{label:"Genio Course Name *",value:N.externalCourseName,onChange:r=>w(a=>({...a,externalCourseName:r})),placeholder:"e.g. M.Sc. in Integrative Nutrition & Dietetics"}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsx(x,{label:"Genio Course ID",value:N.genioCourseId,onChange:r=>w(a=>({...a,genioCourseId:r})),placeholder:"e.g. 2",type:"number"}),e.jsx(x,{label:"Genio Specialization ID",value:N.genioSpecializationId,onChange:r=>w(a=>({...a,genioSpecializationId:r})),placeholder:"e.g. 2",type:"number"})]}),e.jsx(M,{onCancel:()=>O2(null),onSave:ue,saveLabel:"Update"})]})`;

  code = code.slice(0, modalEnd) + editModal + code.slice(modalEnd);

  fs.writeFileSync(filePath, code, "utf8");
  console.log("PATCHED:", relPath);
}

function findModalEnd(code, start) {
  // Find the matching closing }) for the modal starting at `start`
  let depth = 0;
  let i = start;
  let inStr = false;
  let strChar = '';
  while (i < code.length) {
    const ch = code[i];
    if (inStr) {
      if (ch === '\\') { i += 2; continue; }
      if (ch === strChar) inStr = false;
    } else {
      if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strChar = ch; }
      else if (ch === '(') depth++;
      else if (ch === ')') {
        depth--;
        if (depth === 0) return i + 1;
      }
    }
    i++;
  }
  return -1;
}
