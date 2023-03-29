import { SVG, Matrix } from "@svgdotjs/svg.js"

function morphElements(e0: Element, e1: Element, duration: number=1000){
    const s0=SVG(e0)
    const s1=SVG(e1)

    const attrs0=s0.attr()
    const attrs1=s1.attr()

    for (const [k, v] of Object.entries(attrs0)){
        console.log(k, v)
        if(k in attrs1){
            if (v!=attrs1[k]){
                if (k=="transform"){
                    const m0=s0.matrix() as any
                    const m1=s1.matrix() as any
                    s0.transform(m0).animate(duration).transform(m1).ease("-").after(()=>{s0.transform(m0)});
                    s1.transform(m0).animate(duration).transform(m1).ease("-");
                }else{
                    s0.attr(k, v).animate(duration).attr(k, attrs1[k]).ease("-").after(()=>{s0.attr(k, v)});
                    s1.attr(k, v).animate(duration).attr(k, attrs1[k]).ease("-");
                }
            }
        }
    }

    /*const m0=s0.remember("_matrix") ?? s0.matrix() as any
    const m1=s1.remember("_matrix") ?? s1.matrix() as any

    s0.remember("_matrix", m0);
    s1.remember("_matrix", m1);

    s0.transform(m0).animate(duration).transform(m1).ease("-");
    s1.transform(m0).animate(duration).transform(m1).ease("-");*/
}

function transitionPages(p0: SVGElement, p1:SVGElement, duration: number=1000){
    const elements=findMorphableElements(p0, p1);
    for (const [e0, e1] of elements){
        morphElements(e0, e1, duration);
    }
    p0.style.opacity="1";
    p0.style.zIndex="0";
    p1.style.opacity="0";
    p1.style.zIndex="1";
    const now=performance.now();
    function animationFrame(t: number){
        const dt=t-now;
        const progress=dt/duration;
        //p1.style.opacity=progress.toString();
        if (progress<1){
            requestAnimationFrame(animationFrame);
        }else{
            p0.style.opacity="0";
            p1.style.opacity="1";
        }
    }
    requestAnimationFrame(animationFrame);
}

function collectMorphableElements(p0: Element, p1:Element){
    const morphable_elements: [Element, Element][]=[];
    morphable_elements.push([p0, p1]);
    const children0 = Array.from(p0.children);
    const children1 = Array.from(p1.children);
    if(children0.length==children1.length){
        for (let i=0; i<children0.length; i++){
            const c0=children0[i];
            const c1=children1[i];
            morphable_elements.push(...collectMorphableElements(c0, c1));
        }
    }
    return morphable_elements;
}

function findMorphableElements(p0: Element, p1:Element){
    const morphable_elements: [Element, Element][]=[];
    return  morphable_elements
    const groups0 = Array.from(p0.querySelectorAll("g")).filter(e=>e.id)
    const groups1 = Array.from(p1.querySelectorAll("g")).filter(e=>e.id)
    for (const e0 of groups0){
        const e1=groups1.find(e=>e.id==e0.id) as Element;
        if (e1){
            let p0=e0 as Element;
            let p1=e1 as Element;
            /*while(true){
                if (p0.parentElement?.tagName=="g" && p1.parentElement?.tagName=="g"){
                    p0=p0.parentElement;
                    p1=p1.parentElement;
                    morphable_elements.push([p0, p1]);
                }else{
                    break;
                }
            }*/
            morphable_elements.push(...collectMorphableElements(e0, e1));
        }
    }
    console.log(morphable_elements)
    return morphable_elements;
}

let page=0;
let pages=0;

const page_elements: SVGElement[]=[];
const transition_duration=1000;
addEventListener("keydown", (e) => {
    if (e.key=="ArrowRight" || e.key=="ArrowDown"){
        if (page==pages-1) return;
        transitionPages(page_elements[page], page_elements[page+1],transition_duration);
        page++;
    };
    if (e.key=="ArrowLeft" || e.key=="ArrowUp"){
        if (page==0) return;
        transitionPages(page_elements[page], page_elements[page-1],transition_duration);
        page--;
    };
    /*const m00=g1.matrix() as any
    const m10=gg1.matrix() as any
    const m01=g2.matrix() as any
    const m11=gg2.matrix() as any
    g1.transform(m00).animate(transition_duration).transform(m01).ease("-");
    gg1.transform(m10).animate(transition_duration).transform(m11).ease("-");
    g2.transform(m00).animate(transition_duration).transform(m01).ease("-");
    gg2.transform(m10).animate(transition_duration).transform(m11).ease("-");*/
}); 

function ungroup(s: SVGElement){
    for (const c of s.children){
        if (c.tagName=="g"){
            ungroup(c as SVGElement);
            const attrs=SVG(c).attr();
            const m=SVG(c).matrix();
            for (const cc of c.children){
                console.log(cc)
                for (const k in attrs){
                    if (k=="transform"){
                        const cm=m.transform(SVG(c).matrix());
                        SVG(cc).transform(cm);
                        console.log(cm, cc)
                    }else if (k=="id"){

                    }else{
                        cc.setAttribute(k, attrs[k]);
                    }
                }
            }
            //c.replaceWith(...c.children);
        }
    }
}


for (const e of document.body.children){
    if (e.tagName=="svg"){
        const s=e as SVGElement;
        s.setAttribute("viewBox", "-71.999989 -71.999989 453.543292 255.118106");
        s.style.display="block";
        s.style.width="100%";
        s.style.height="100%";
        s.style.position="absolute";
        s.style.opacity="0";
        //ungroup(s);
        page_elements.push(s);
        pages++;
    }
}

page_elements[0].style.opacity="1";


//console.log(findMorphableElements(page_elements[2], page_elements[3]));
/*const g1=SVG("#page1").findOne("#group")!.children()[0];
const g2=SVG("#page2").findOne("#group")!.children()[0];
const gg1=g1.children()[0];
const gg2=g2.children()[0];
//
//

console.log(g1)*/