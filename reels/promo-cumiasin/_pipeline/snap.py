import json, sys
from playwright.sync_api import sync_playwright
TL=json.load(open('timeline.json'))
times=[float(x) for x in sys.argv[1:]]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--disable-gpu','--force-color-profile=srgb'])
    pg=b.new_page(viewport={'width':1080,'height':1920},device_scale_factor=1)
    pg.add_init_script(f"window.TL={json.dumps(TL)};")
    pg.goto('file:///home/claude/prod/build/render.html'); pg.wait_for_timeout(300)
    for t in times:
        pg.evaluate(f"render({t})")
        pg.screenshot(path=f'snap_{t:05.2f}.jpg',type='jpeg',quality=90,clip={'x':0,'y':0,'width':1080,'height':1920})
    b.close()
