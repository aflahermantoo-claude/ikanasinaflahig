import json, sys, subprocess, os
from playwright.sync_api import sync_playwright
TL=json.load(open('timeline.json')); END=TL['END']
B=[0,4.5,11.5,17.1,21.2,31.6,39.4,45.55,49.15,END]
idx=[int(x) for x in sys.argv[1:]]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--disable-gpu','--force-color-profile=srgb'])
    pg=b.new_page(viewport={'width':1080,'height':1920},device_scale_factor=1)
    pg.add_init_script(f"window.TL={json.dumps(TL)};")
    pg.goto('file:///home/claude/prod/build/render.html'); pg.wait_for_timeout(300)
    for k in idx:
        f0,f1=round(B[k]*30),round(B[k+1]*30)
        tmp=f'scenes/s{k}.tmp.mp4'
        ff=subprocess.Popen(['ffmpeg','-y','-v','error','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-r','30','-g','60',tmp],stdin=subprocess.PIPE)
        for i in range(f0,f1):
            pg.evaluate(f"render({i/30})")
            ff.stdin.write(pg.screenshot(type='jpeg',quality=92,clip={'x':0,'y':0,'width':1080,'height':1920}))
        ff.stdin.close(); rc=ff.wait()
        if rc==0:
            os.replace(tmp,f'scenes/s{k}.mp4'); print('scene',k,'ok',f1-f0,flush=True)
        else:
            print('scene',k,'FAIL',flush=True)
    b.close()
