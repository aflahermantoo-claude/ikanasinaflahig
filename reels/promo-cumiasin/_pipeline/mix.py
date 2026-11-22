import json, subprocess, numpy as np
SR=48000; A='/home/claude/prod/audio/'
TL=json.load(open('/home/claude/prod/build/timeline.json')); END=TL['END']
N=int((END+0.2)*SR)
def load(f):
    r=subprocess.run(['ffmpeg','-v','error','-i',A+f,'-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(r,dtype=np.float32).copy()
def place(buf,x,t,g=1.0):
    i=int(t*SR); j=min(N,i+len(x)); 
    if i<N: buf[i:j]+=x[:j-i]*g
def fade(x,fi=0.01,fo=0.03):
    x=x.copy(); a=int(fi*SR); b=int(fo*SR)
    if a: x[:a]*=np.linspace(0,1,a)
    if b: x[-b:]*=np.linspace(1,0,b)
    return x
def rms(x): return np.sqrt(np.mean(x[np.abs(x)>0.01]**2))
src={k:load(k+'.mp3') for k in ['narrator','supplier','mascot']}
vo=np.zeros(N,np.float32)
target=0.12
for k,v in TL.items():
    if k=='END': continue
    s=src[v['file']][int((v['a']-0.04)*SR if v['a']>0.04 else 0):int((v['b']+0.12)*SR)]
    s=fade(s,0.01,0.08); g=target/rms(s)
    place(vo,s,v['t']-0.04,g)
# music
mus=np.zeros(N,np.float32)
def mseg(f,t0,tin,tout,dur=None,fi=0.4,fo=0.6):
    x=load(f)
    if dur: x=x[:int(dur*SR)]
    x=fade(x,fi,fo); place(mus,x*(0.09/rms(x)),t0)
mseg('music_a.mp3',0.8,None,None,dur=16.0-0.0,fi=0.6,fo=0.12)      # ends ~16.8 (scratch)
mseg('music_b.mp3',21.2,None,None,dur=16.0,fi=0.5,fo=1.2)           # 21.2-37.2
mseg('music_c.mp3',39.15,None,None,dur=END-39.15,fi=0.05,fo=1.2)    # hero
# twist: music B lower from 31.7 to 37.2
env=np.ones(N,np.float32)
i0,i1=int(31.6*SR),int(32.4*SR); env[i0:i1]=np.linspace(1,0.45,i1-i0); env[i1:int(37.3*SR)]=0.45
mus*=env
# ducking by VO envelope
ve=np.convolve(np.abs(vo),np.ones(int(0.05*SR))/int(0.05*SR),'same')
act=(ve>0.01).astype(np.float32)
k=np.ones(int(0.25*SR))/int(0.25*SR); act=np.clip(np.convolve(act,k,'same')*1.6,0,1)
mus*= (1.0-0.55*act)
# sfx
sfx=np.zeros(N,np.float32)
def S(f,t,g): x=load(f); place(sfx,fade(x,0.005,0.05)*(g/ max(1e-6,np.abs(x).max())),t)
t=np.arange(int(1.5*SR))/SR
def tone(freqs,dec,dur): tt=np.arange(int(dur*SR))/SR; y=sum(np.sin(2*np.pi*f*tt)*a for f,a in freqs); return (y*np.exp(-tt*dec)).astype(np.float32)
def pop():
    tt=np.arange(int(0.12*SR))/SR; f=900*np.exp(-tt*25)+250; ph=2*np.pi*np.cumsum(f)/SR; return (np.sin(ph)*np.exp(-tt*35)).astype(np.float32)
def click():
    tt=np.arange(int(0.025*SR))/SR; n=np.random.RandomState(3).randn(len(tt)); return (np.convolve(n,[1,-0.9],'same')*np.exp(-tt*220)*0.5).astype(np.float32)
ding=tone([(1318,1),(2637,0.35),(3951,0.12)],5,1.0); ting=tone([(2093,1),(4186,0.4),(3136,0.3)],3.5,1.4)
S('sfx_send.mp3',0.15,0.55)
for k in ['S1','S2','S3']: S('sfx_ping.mp3',TL[k]['t']-0.18,0.45)
place(sfx,pop()*0.5,9.9)
S('sfx_tick.mp3',11.55,0.35)
S('sfx_scratch.mp3',16.72,0.75)
S('sfx_piano.mp3',17.25,0.6)
place(sfx,ding*0.32,21.25)
for k in ['N5','N6']: place(sfx,pop()*0.55,TL[k]['t']-0.3)
S('sfx_glass.mp3',38.25,0.8)
S('sfx_land.mp3',38.55,0.95)
place(sfx,pop()*0.5,40.0)
for i in range(9): place(sfx,click()*0.9,TL['M3']['t']+0.1+i*0.1)
place(sfx,pop()*0.5,TL['M4']['t']-0.2)
place(sfx,ting*0.3,TL['M4']['e']+0.1)
mix=vo*1.0+mus+sfx
pk=np.abs(mix).max(); mix=mix/pk*0.95
mix=np.tanh(mix*1.25)/np.tanh(1.25)*0.89
st=np.stack([mix,mix],1).astype(np.float32)
open('/home/claude/prod/build/mix.f32','wb').write(st.tobytes())
subprocess.run(['ffmpeg','-y','-v','error','-f','f32le','-ar',str(SR),'-ac','2','-i','/home/claude/prod/build/mix.f32','-c:a','pcm_s16le','/home/claude/prod/build/mix.wav'],check=True)
print('mix ok', END, 'vo rms',rms(vo),'mus rms',rms(mus))
