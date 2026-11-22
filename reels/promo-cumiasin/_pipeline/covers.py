import json
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont
TL=json.load(open('timeline.json'))
CSS = """
#ui{display:none}
.cv{position:absolute;font-family:Inter;color:#F9FAFB;letter-spacing:-0.02em}
.t{left:60px;right:60px;text-align:center;font-weight:800;line-height:1.05;text-shadow:0 8px 30px rgba(0,0,0,.55)}
.g{color:#E2B65C}
.gl{background:rgba(255,255,255,0.12);backdrop-filter:blur(26px);border:2px solid rgba(255,255,255,0.3);border-radius:999px}
.dim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,18,32,0) 40%,rgba(11,18,32,.85) 100%)}
"""
COV = {
 'A': (14.6, (400,640,2.1), """
  <svg class="cv" style="inset:0" viewBox="0 0 1080 1920" width="1080" height="1920"><line x1="540" y1="760" x2="2040.0" y2="760.0" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="760" x2="1966.6585799032425" y2="1223.2982801483981" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="760" x2="1753.8062714820485" y2="1641.2912885708379" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="760" x2="1422.2575954970625" y2="1973.1040908296952" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="760" x2="1004.4342195855363" y2="2186.289190759705" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="760" x2="541.1944900660999" y2="2259.999524397752" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="760" x2="77.83795308301148" y2="2187.027064350743" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="760" x2="-340.3244227857889" y2="1974.5076824157463" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="760" x2="-672.4011409039651" y2="1643.2233429516928" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="760" x2="-885.9188971543733" y2="1225.5698645080624" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="760" x2="-959.9980975913093" y2="762.3889793747303" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="760" x2="-887.3946438685366" y2="298.97447938816526" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="760" x2="-675.208323185999" y2="-119.35699875504054" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="760" x2="-344.18853032231357" y2="-451.6974221506239" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="760" x2="73.29478580417668" y2="-665.5476993220643" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="760" x2="536.4165328315777" y2="-739.9957195815769" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="760" x2="999.8887019536484" y2="-667.7613182235286" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="760" x2="1418.3890170920722" y2="-455.908193348504" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="760" x2="1750.9929350159257" y2="-125.15315699686323" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="760" x2="1965.175597498168" y2="292.15973207114854" stroke="#E2B65C" stroke-width="10" opacity="0.35"/></svg>
  <div class="dim" style="background:linear-gradient(180deg,rgba(11,18,32,.6) 0%,rgba(11,18,32,0) 28%,rgba(11,18,32,0) 52%,rgba(11,18,32,.96) 70%)"></div>
  <div class="cv" style="left:50%;top:290px;transform:translateX(-50%) rotate(-6deg);background:#E2B65C;color:#0B1220;font-size:92px;font-weight:900;padding:10px 46px;border-radius:24px;box-shadow:0 14px 40px rgba(0,0,0,.5)">AWAS!</div>
  <div class="cv t" style="top:1330px;font-size:84px;font-weight:800">Alasan ini bikin warung</div>
  <div class="cv t" style="top:1430px;font-size:210px;font-weight:900;color:#E2B65C">SEPI!</div>
 """),
 'B': (10.2, None, """
  <svg class="cv" style="inset:0" viewBox="0 0 1080 1920" width="1080" height="1920"><line x1="300" y1="700" x2="1800.0" y2="700.0" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="300" y1="700" x2="1726.6585799032425" y2="1163.2982801483981" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="300" y1="700" x2="1513.8062714820485" y2="1581.2912885708379" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="300" y1="700" x2="1182.2575954970625" y2="1913.1040908296952" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="300" y1="700" x2="764.4342195855363" y2="2126.289190759705" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="300" y1="700" x2="301.1944900660999" y2="2199.999524397752" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="300" y1="700" x2="-162.16204691698852" y2="2127.027064350743" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="300" y1="700" x2="-580.3244227857889" y2="1914.5076824157463" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="300" y1="700" x2="-912.4011409039651" y2="1583.2233429516928" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="300" y1="700" x2="-1125.9188971543733" y2="1165.5698645080624" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="300" y1="700" x2="-1199.9980975913093" y2="702.3889793747303" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="300" y1="700" x2="-1127.3946438685366" y2="238.97447938816526" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="300" y1="700" x2="-915.208323185999" y2="-179.35699875504054" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="300" y1="700" x2="-584.1885303223136" y2="-511.6974221506239" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="300" y1="700" x2="-166.70521419582332" y2="-725.5476993220643" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="300" y1="700" x2="296.4165328315777" y2="-799.9957195815769" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="300" y1="700" x2="759.8887019536484" y2="-727.7613182235286" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="300" y1="700" x2="1178.3890170920722" y2="-515.908193348504" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="300" y1="700" x2="1510.9929350159257" y2="-185.15315699686323" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="300" y1="700" x2="1725.175597498168" y2="232.15973207114854" stroke="#E2B65C" stroke-width="10" opacity="0.35"/></svg>
  <div class="dim" style="background:linear-gradient(180deg,rgba(11,18,32,0) 48%,rgba(11,18,32,.96) 66%)"></div>
  <div class="cv" style="left:70px;top:250px;font-size:560px;font-weight:900;color:#E2B65C;line-height:1;letter-spacing:-0.06em;text-shadow:0 20px 60px rgba(0,0,0,.6)">3</div>
  <div class="cv" style="left:420px;top:380px;font-size:92px;font-weight:900;line-height:1.02;text-shadow:0 8px 30px rgba(0,0,0,.6)">ALASAN<br>SUPPLIER</div>
  <div class="cv t" style="top:1320px;font-size:84px;font-weight:800">yang bikin warung</div>
  <div class="cv t" style="top:1420px;font-size:210px;font-weight:900;color:#E2B65C">SEPI!</div>
 """),
 'C': (7.0, (226,875,2.0), """
  <svg class="cv" style="inset:0" viewBox="0 0 1080 1920" width="1080" height="1920"><line x1="540" y1="900" x2="2040.0" y2="900.0" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="900" x2="1966.6585799032425" y2="1363.2982801483981" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="900" x2="1753.8062714820485" y2="1781.2912885708379" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="900" x2="1422.2575954970625" y2="2113.1040908296955" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="900" x2="1004.4342195855363" y2="2326.289190759705" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="900" x2="541.1944900660999" y2="2399.999524397752" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="900" x2="77.83795308301148" y2="2327.027064350743" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="900" x2="-340.3244227857889" y2="2114.5076824157463" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="900" x2="-672.4011409039651" y2="1783.2233429516928" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="900" x2="-885.9188971543733" y2="1365.5698645080624" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="900" x2="-959.9980975913093" y2="902.3889793747303" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="900" x2="-887.3946438685366" y2="438.97447938816526" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="900" x2="-675.208323185999" y2="20.643001244959464" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="900" x2="-344.18853032231357" y2="-311.6974221506239" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="900" x2="73.29478580417668" y2="-525.5476993220643" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="900" x2="536.4165328315777" y2="-599.9957195815769" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="900" x2="999.8887019536484" y2="-527.7613182235286" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="900" x2="1418.3890170920722" y2="-315.908193348504" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="900" x2="1750.9929350159257" y2="14.846843003136769" stroke="#E2B65C" stroke-width="10" opacity="0.35"/><line x1="540" y1="900" x2="1965.175597498168" y2="432.15973207114854" stroke="#E2B65C" stroke-width="10" opacity="0.35"/></svg>
  <div class="dim" style="background:linear-gradient(180deg,rgba(11,18,32,.9) 0%,rgba(11,18,32,.6) 25%,rgba(11,18,32,0) 36%,rgba(11,18,32,0) 52%,rgba(11,18,32,.96) 68%)"></div>
  <div class="cv" style="left:50%;top:290px;transform:translateX(-50%) rotate(-5deg);background:#E2B65C;color:#0B1220;font-size:96px;font-weight:900;padding:10px 46px;border-radius:24px;white-space:nowrap;box-shadow:0 14px 40px rgba(0,0,0,.5)">JANGAN PERCAYA!</div>
  <div class="cv" style="left:50%;top:1330px;transform:translateX(-50%) rotate(2deg);background:rgba(255,255,255,.95);color:#111827;border-radius:56px 56px 56px 14px;padding:30px 56px;font-size:120px;font-weight:900;white-space:nowrap;letter-spacing:-0.03em">"Besok ya, Ka."</div>
  <svg class="cv" style="left:110px;top:1400px" width="860" height="80"><line x1="0" y1="40" x2="860" y2="40" stroke="#E2B65C" stroke-width="18" stroke-linecap="round" transform="rotate(-4 430 40)"/></svg>
 """),
}
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--disable-gpu','--force-color-profile=srgb'])
    pg=b.new_page(viewport={'width':1080,'height':1920})
    pg.add_init_script(f"window.TL={json.dumps(TL)};")
    pg.goto('file:///home/claude/prod/build/render.html'); pg.wait_for_timeout(300)
    pg.add_style_tag(content=CSS)
    for k,(t,zoom,html) in COV.items():
        pg.evaluate(f"render({t})")
        z = f"translate({540-zoom[0]}px,{900-zoom[1]}px) scale({zoom[2]})" if zoom else ""
        org = f"{zoom[0]}px {zoom[1]}px" if zoom else "50% 50%"
        pg.evaluate("""([z,org,html])=>{const a=document.getElementById('art');a.style.transformOrigin=org;a.style.transform=z;
          let o=document.getElementById('cov'); if(o) o.remove(); o=document.createElement('div'); o.id='cov'; o.style.cssText='position:absolute;inset:0';
          o.innerHTML=html; document.getElementById('stage').appendChild(o);}""", [z,org,html])
        pg.screenshot(path=f'cover_{k}.jpg',type='jpeg',quality=92,clip={'x':0,'y':0,'width':1080,'height':1920})
    b.close()
# side-by-side sheet with 3:4 grid-crop guides
W,H=480,853; pad=30; top=70
sheet=Image.new('RGB',(pad+3*(W+pad), top+H+150),(245,245,247)); d=ImageDraw.Draw(sheet)
f1=ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-SemiBold.otf',30)
f2=ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-Regular.otf',22)
names={'A':'A1 · Peringatan','B':'A2 · Angka','C':'A3 · Larangan + kutipan'}
y0=int(240/1920*H); y1=int(1680/1920*H)
for i,k in enumerate('ABC'):
    x=pad+i*(W+pad); im=Image.open(f'cover_{k}.jpg').resize((W,H)); sheet.paste(im,(x,top))
    for yy in (y0,y1):
        for xx in range(x,x+W,18): d.line([(xx,top+yy),(xx+9,top+yy)],fill=(226,75,74),width=3)
    d.text((x,top+H+18),names[k],font=f1,fill=(17,24,39))
    d.text((x,top+H+60),'Garis merah = potongan grid profil 3:4',font=f2,fill=(107,114,128))
d.text((pad,22),'Model Bombastis · 3 varian',font=f1,fill=(17,24,39))
sheet.save('/mnt/user-data/outputs/thumbnail_bombastis_3_varian.jpg',quality=90)
print('ok')
