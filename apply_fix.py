#!/usr/bin/env python3
import sys

with open('assets/index-Ir5NYANW.js', 'r', encoding='utf-8') as f:
    text = f.read()

orig_len = len(text)
print("Original size:", orig_len)

# 1. REMOVE FAQ SECTION FROM LANDINGVIEW
faq_start = ',Y_faq.enabled!==!1&&e.jsxs("section",{id:"faq-section"'
idx_faq = text.find(faq_start)
assert idx_faq != -1, "FAQ start not found"
idx_faq_end = text.find(',e.jsx(Gc,', idx_faq)
assert idx_faq_end != -1, "FAQ end not found"

text = text[:idx_faq] + text[idx_faq_end:]
print("1. Removed FAQ section from LandingView!")

# 2. UPDATE CTA BANNER BUTTONS FOR MOBILE: SAME ROW (GRID 2 COLS)
cta_buttons_old = 'e.jsxs("div",{className:"flex flex-wrap items-center justify-center gap-3 shrink-0",children:[e.jsxs("button",{onClick:()=>be("register"),className:"px-6 py-3.5 bg-white text-indigo-700 font-bold rounded-xl text-sm shadow-md hover:bg-slate-50 transition flex items-center gap-2 active:scale-95 cursor-pointer",children:[e.jsx("span",{children:F.primaryButtonText||"Đăng ký"}),e.jsx(ds,{className:"w-4 h-4"})]}),e.jsxs("button",{onClick:Oe,className:"px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold rounded-xl text-sm transition flex items-center gap-2 cursor-pointer",children:[e.jsx("span",{children:F.secondaryButtonText||"Xem bảng giá"}),e.jsx(ds,{className:"w-4 h-4"})]})]})'

cta_buttons_new = 'e.jsxs("div",{className:"grid grid-cols-2 gap-2 sm:gap-3 w-full sm:w-auto shrink-0",children:[e.jsxs("button",{onClick:()=>be("register"),className:"w-full px-2.5 sm:px-6 py-3 sm:py-3.5 bg-white text-indigo-700 font-bold rounded-xl text-xs sm:text-sm shadow-md hover:bg-slate-50 transition flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 cursor-pointer text-center whitespace-nowrap",children:[e.jsx("span",{children:F.primaryButtonText||"Đăng ký ngay"}),e.jsx(ds,{className:"w-3.5 h-3.5 sm:w-4 sm:h-4"})]}),e.jsxs("button",{onClick:Oe,className:"w-full px-2.5 sm:px-6 py-3 sm:py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer text-center whitespace-nowrap",children:[e.jsx("span",{children:F.secondaryButtonText||"Xem bảng giá"}),e.jsx(ds,{className:"w-3.5 h-3.5 sm:w-4 sm:h-4"})]})]})'

assert cta_buttons_old in text, "cta_buttons_old not found"
text = text.replace(cta_buttons_old, cta_buttons_new, 1)
print("2. Updated CTA buttons to 1 single row on mobile!")

# 3. FIX FOOTER ADMIN EFFECT (PREVENT REVERTING DELETED TEXT)
ue_old = 'b.useEffect(()=>{p&&(lt(prev=>({...p,autoPaymentConfig:{...p.autoPaymentConfig},footerConfig:{...p.footerConfig},announcementActive:(typeof window!=="undefined"&&window._lastAnnouncementToggleTime&&Date.now()-window._lastAnnouncementToggleTime<60000&&prev.announcementActive!==void 0)?prev.announcementActive:p.announcementActive,announcementText:(typeof window!=="undefined"&&window._lastAnnouncementToggleTime&&Date.now()-window._lastAnnouncementToggleTime<60000&&prev.announcementText!==void 0)?prev.announcementText:p.announcementText,popupModal:(typeof window!=="undefined"&&window._lastAnnouncementToggleTime&&Date.now()-window._lastAnnouncementToggleTime<60000&&prev.popupModal!==void 0)?prev.popupModal:(p.popupModal||prev.popupModal)})),p.defaultBioFooterText&&On(p.defaultBioFooterText),p.defaultBioFooterLink&&to(p.defaultBioFooterLink),p.footerConfig&&Ot(p.footerConfig))},[p]);'

ue_new = 'b.useEffect(()=>{p&&(lt(prev=>({...p,autoPaymentConfig:{...p.autoPaymentConfig},footerConfig:{...p.footerConfig},announcementActive:(typeof window!=="undefined"&&window._lastAnnouncementToggleTime&&Date.now()-window._lastAnnouncementToggleTime<60000&&prev.announcementActive!==void 0)?prev.announcementActive:p.announcementActive,announcementText:(typeof window!=="undefined"&&window._lastAnnouncementToggleTime&&Date.now()-window._lastAnnouncementToggleTime<60000&&prev.announcementText!==void 0)?prev.announcementText:p.announcementText,popupModal:(typeof window!=="undefined"&&window._lastAnnouncementToggleTime&&Date.now()-window._lastAnnouncementToggleTime<60000&&prev.popupModal!==void 0)?prev.popupModal:(p.popupModal||prev.popupModal)})))},[p]);'

assert ue_old in text, "ue_old not found"
text = text.replace(ue_old, ue_new, 1)
print("3. Prevented useEffect from overwriting footer fields on poll!")

# 4. FIX so (SAVE FOOTER CONFIG) TO PRESERVE EMPTY STRINGS & AWAIT PERSISTENCE
so_old = 'so=c=>{const C={...p,defaultBioFooterText:Vn,defaultBioFooterLink:ps,footerConfig:xt};u(C),S("Đã cập nhật cấu hình Chân trang & Bản quyền thành công!")}'

so_new = 'so=async c=>{c&&c.preventDefault&&c.preventDefault();const C={...p,defaultBioFooterText:Vn??\"\",defaultBioFooterLink:ps??\"\",footerConfig:xt};await u(C);const P=JSON.stringify({defaultBioFooterText:Vn??\"\",defaultBioFooterLink:ps??\"\",footerConfig:xt}),eps=[\"/save_config.php\",\"save_config.php\",\"/api/system/config\"];for(const ep of eps)fetch(ep+\"?_t=\"+Date.now(),{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:P}).catch(()=>{});S(\"Đã cập nhật cấu hình Chân trang & Bản quyền thành công!\")}'

assert so_old in text, "so_old not found"
text = text.replace(so_old, so_new, 1)
print("4. Upgraded so save function to preserve empty strings and sync to hosting!")

# 5. FIX Ih (SAVE ALL CONFIG) TO PRESERVE DELETED TEXT
ih_old = 'Ih=c=>{var Q;c.preventDefault();const C={...p,...K,defaultBioFooterText:K.defaultBioFooterText||Vn,defaultBioFooterLink:K.defaultBioFooterLink||ps,footerConfig:{...p.footerConfig||{},...K.footerConfig||xt,copyrightText:((Q=K.footerConfig)==null?void 0:Q.copyrightText)||xt.copyrightText}};'

ih_new = 'Ih=async c=>{c.preventDefault();const C={...p,...K,defaultBioFooterText:Vn??\"\",defaultBioFooterLink:ps??\"\",footerConfig:{...p.footerConfig||{},...xt}};await u(C);const P=JSON.stringify(C),eps=[\"/save_config.php\",\"save_config.php\",\"/api/system/config\"];for(const ep of eps)fetch(ep+\"?_t=\"+Date.now(),{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:P}).catch(()=>{});'

assert ih_old in text, "ih_old not found"
text = text.replace(ih_old, ih_new, 1)
print("5. Upgraded Ih to preserve deleted text!")

# 6. FIX AuthContext defaultBioFooterText fallback
fb_old = 'U=$.defaultBioFooterText&&$.defaultBioFooterText.toLowerCase().includes("linkbio")?"Đăng ký miễn phí TRANG CÁ NHÂN":$.defaultBioFooterText||Li.defaultBioFooterText'

fb_new = 'U=$.defaultBioFooterText!==void 0?($.defaultBioFooterText&&$.defaultBioFooterText.toLowerCase().includes("linkbio")?"Đăng ký miễn phí TRANG CÁ NHÂN":$.defaultBioFooterText):Li.defaultBioFooterText'

assert fb_old in text, "fb_old not found"
text = text.replace(fb_old, fb_new, 1)
print("6. Fixed AuthContext fallback for empty defaultBioFooterText!")

with open('assets/index-Ir5NYANW.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("Patch applied successfully! New size:", len(text))
