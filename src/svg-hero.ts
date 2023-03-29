
function findParentWithTag<T extends Element= SVGElement>(element: Element, tagName: string){
    while (element.parentElement){
        if (element.parentElement.tagName==tagName){
            return element.parentElement as unknown as T;
        }
        element=element.parentElement;
    }
    return null;
}

function getTransitionMatrix(from: SVGElement, to: SVGElement){
    let matrix: SVGMatrix | null = null;
    while (from!=to){
        if ("transform" in to && to.transform){
            const consolidated=(to as SVGGraphicsElement).transform.baseVal.consolidate();
            if (consolidated){
                if (!matrix){
                    matrix=consolidated.matrix;
                }else{
                    matrix=consolidated.matrix.multiply(matrix);
                }
            }
        }
        to=to.parentElement as unknown as SVGElement;
        if (!to){
            throw new Error("Could not find parent");
        }
    }
    return matrix;
}

function getAttributes(from: SVGElement, to: SVGElement){
    const attributes=new Map<string, string>();
    while (from!=to){
        for (const attribute of from.attributes){
            if (attribute.name=="id"){
                continue;
            }
            if (attribute.name=="transform"){
                continue;
            }
            if (!attributes.has(attribute.name)){
                attributes.set(attribute.name, attribute.value);
            }
        }
        from=from.parentElement as unknown as SVGElement;
        if (!from){
            throw new Error("Could not find parent");
        }
    }
    return attributes;
}

interface MatrixObject {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
}

function cloneMatrix(matrix: DOMMatrix | SVGMatrix | undefined): MatrixObject{
    if (!matrix){
        return {
            a: 1,
            b: 0,
            c: 0,
            d: 1,
            e: 0,
            f: 0
        }
    }else{
        return {
            a: matrix.a,
            b: matrix.b,
            c: matrix.c,
            d: matrix.d,
            e: matrix.e,
            f: matrix.f
        }
    }
}


class HeroElement{
    private from: SVGGraphicsElement;
    private to: SVGGraphicsElement;

    private fromSVG: SVGSVGElement;
    private toSVG: SVGSVGElement;

    private fromIntermediateMatrix: SVGMatrix;
    private toIntermediateMatrix: SVGMatrix;

    private fromMatrix: MatrixObject | undefined;
    private toMatrix: MatrixObject | undefined;

    private fromX: number | undefined;
    private toX: number | undefined;
    private fromY: number | undefined;
    private toY: number | undefined;

    constructor(from: SVGGraphicsElement, to: SVGGraphicsElement){
        const potentialFromSVG=findParentWithTag<SVGSVGElement>(from, "svg");
        if (!potentialFromSVG){
            throw new Error("Could not find parent SVG for from element");
        }
        const potentialToSVG=findParentWithTag<SVGSVGElement>(to, "svg");
        if (!potentialToSVG){
            throw new Error("Could not find parent SVG for to element");
        }
        this.fromSVG=potentialFromSVG;
        this.toSVG=potentialToSVG;
        this.from=from;
        this.to=to;

        function hasAttr(attr: string){
            return from.hasAttribute(attr) && to.hasAttribute(attr);
        }

        if (hasAttr("x")){
            this.fromX=parseFloat(from.getAttribute("x")!);
            this.toX=parseFloat(to.getAttribute("x")!);
        }

        if (hasAttr("y")){
            this.fromY=parseFloat(from.getAttribute("y")!);
            this.toY=parseFloat(to.getAttribute("y")!);
        }

        if(this.from.transform.baseVal.length>0 && this.to.transform.baseVal.length>0){
            this.fromMatrix=cloneMatrix(this.from.transform.baseVal.consolidate()?.matrix);
            this.toMatrix=cloneMatrix(this.to.transform.baseVal.consolidate()?.matrix);
        }

        this.fromIntermediateMatrix=potentialFromSVG.createSVGMatrix();
        this.toIntermediateMatrix=potentialToSVG.createSVGMatrix();

    }
    
    setProgress(progress: number){
        if(this.fromMatrix && this.toMatrix){
            const m={
                a : this.fromMatrix.a*(1-progress)+this.toMatrix.a*(progress),
                b : this.fromMatrix.b*(1-progress)+this.toMatrix.b*(progress),
                c : this.fromMatrix.c*(1-progress)+this.toMatrix.c*(progress),
                d : this.fromMatrix.d*(1-progress)+this.toMatrix.d*(progress),
                e : this.fromMatrix.e*(1-progress)+this.toMatrix.e*(progress),
                f : this.fromMatrix.f*(1-progress)+this.toMatrix.f*(progress)
            }
            this.fromIntermediateMatrix.a=m.a;
            this.fromIntermediateMatrix.b=m.b;
            this.fromIntermediateMatrix.c=m.c;
            this.fromIntermediateMatrix.d=m.d;
            this.fromIntermediateMatrix.e=m.e;
            this.fromIntermediateMatrix.f=m.f;

            this.toIntermediateMatrix.a=m.a;
            this.toIntermediateMatrix.b=m.b;
            this.toIntermediateMatrix.c=m.c;
            this.toIntermediateMatrix.d=m.d;
            this.toIntermediateMatrix.e=m.e;
            this.toIntermediateMatrix.f=m.f;
            
            this.from.transform.baseVal[0].setMatrix(this.fromIntermediateMatrix);
            this.to.transform.baseVal[0].setMatrix(this.toIntermediateMatrix);
        }
        if(this.fromX && this.toX){
            const x=this.fromX*(1-progress)+this.toX*(progress);
            //(this.from as any).x.baseVal.value=x;
            //(this.to as any).x.baseVal.value=x;
            this.from.setAttribute("x", x.toString());
            this.to.setAttribute("x", x.toString());
            (this.from as SVGGraphicsElement).x
        }
        if(this.fromY && this.toY){
            const y=this.fromY*(1-progress)+this.toY*(progress);
            (this.from as any).y.baseVal.value=y;
            (this.to as any).y.baseVal.value=y;
        }
    }
}

export class SVGHero{
    private fromSVG: SVGSVGElement;
    private toSVG: SVGSVGElement;
    private from: SVGElement;
    private to: SVGElement;
    private fromHero: SVGGraphicsElement;
    private toHero: SVGGraphicsElement;
    private elements: HeroElement[]=[];

    constructor(from: SVGElement, to: SVGElement){
        const potentialFromSVG=findParentWithTag<SVGSVGElement>(from, "svg");
        if (!potentialFromSVG){
            throw new Error("Could not find parent SVG for from element");
        }
        const potentialToSVG=findParentWithTag<SVGSVGElement>(to, "svg");
        if (!potentialToSVG){
            throw new Error("Could not find parent SVG for to element");
        }
        this.fromSVG=potentialFromSVG;
        this.toSVG=potentialToSVG;
        this.from=from;
        this.to=to;
        
        this.fromHero=this.from.cloneNode(true) as SVGGraphicsElement;
        getAttributes(this.from, this.fromSVG).forEach((value, key)=>this.fromHero.setAttribute(key, value));
        //this.fromHero.setAttribute("transform", getTransitionMatrix(this.fromSVG, this.from).toString());
        this.fromHero.transform.baseVal.clear();
        const fromMatrix=getTransitionMatrix(this.fromSVG, this.from);
        if (fromMatrix){
            const fromHeroTransform=this.fromSVG.createSVGTransformFromMatrix(fromMatrix);
            this.fromHero.transform.baseVal.initialize(fromHeroTransform);
        }
        this.fromSVG.appendChild(this.fromHero);
        this.from.style.visibility="hidden";
        
        this.toHero=this.to.cloneNode(true) as SVGGraphicsElement;
        getAttributes(this.to, this.toSVG).forEach((value, key)=>this.toHero.setAttribute(key, value));
        //this.toHero.setAttribute("transfrom", getTransitionMatrix(this.toSVG, this.to).toString());
        this.toHero.transform.baseVal.clear();
        const toMatrix=getTransitionMatrix(this.toSVG, this.to);
        if (toMatrix){
            const toHeroTransform=this.toSVG.createSVGTransformFromMatrix(toMatrix);
            this.toHero.transform.baseVal.initialize(toHeroTransform);
        }
        this.toSVG.appendChild(this.toHero);
        this.to.style.visibility="hidden";
        
        this.elements.push(new HeroElement(this.fromHero, this.toHero));

        const recursiveHeroElements=(to: SVGGraphicsElement, from: SVGGraphicsElement)=>{
            if (to.children.length>0 && from.children.length>0){
                for (let i=0; i<to.children.length; i++){
                    const toChild=to.children[i] as SVGGraphicsElement;
                    const fromChild=from.children[i] as SVGGraphicsElement;
                    if (toChild && fromChild){
                        this.elements.push(new HeroElement(fromChild, toChild));
                        recursiveHeroElements(toChild, fromChild);
                    }
                }
            }
        }
        recursiveHeroElements(this.toHero, this.fromHero)

    }

    setProgress(progress: number){
        this.elements.forEach(element=>element.setProgress(progress));
    }

    remove(){
        this.from.style.removeProperty("visibility");
        this.to.style.removeProperty("visibility");
        this.fromHero.remove();
        this.toHero.remove();
    }
}
