import json, subprocess
A='/home/claude/prod/audio/'
# (id, file, seg_start, seg_end) from silencedetect
segs = {
 'N1':('narrator',0.00,3.75),'N2':('narrator',5.12,9.99),'N3':('narrator',11.24,14.50),
 'N4':('narrator',15.61,17.68),'N5':('narrator',18.44,22.55),'N6':('narrator',23.04,25.70),
 'N7':('narrator',26.33,33.41),
 'S1':('supplier',0.00,1.43),'S2':('supplier',3.21,5.25),'S3':('supplier',6.84,8.99),
 'M1':('mascot',0.00,5.26),'M2':('mascot',6.54,9.76),'M3':('mascot',10.77,12.91),'M4':('mascot',13.66,17.48),
}
# placement: (id, start_time)
order = [('N1',0.45),('S1',None),('S2',None),('S3',None),('N2',None),('N3',None),('N4',None),
         ('N5',None),('N6',None),('N7',None),('M1',None),('M2',None),('M3',None),('M4',None)]
gap = {'S1':0.55,'S2':0.45,'S3':0.45,'N2':0.5,'N3':1.0,'N4':0.6,'N5':0.5,'N6':0.4,'N7':0.5,'M1':1.3,'M2':0.35,'M3':0.4,'M4':0.45}
tl={}; t=0
for sid,st in order:
    f,a,b = segs[sid]; d=round(b-a,2)
    if st is None: st = round(t + gap[sid],2)
    tl[sid]={'file':f,'a':a,'b':b,'d':d,'t':st,'e':round(st+d,2)}
    t = st+d
end = round(t+1.6,2)
tl['END']=end
json.dump(tl,open('timeline.json','w'),indent=1)
for k,v in tl.items(): print(k,v)
