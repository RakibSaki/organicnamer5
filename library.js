class DistanceTo {
    constructor (atom, distance) {
        [this.atom, this.distance] = [atom, distance]
    }
}

class Atom {
    constructor(x, y, bondWith) {
        [this.x, this.y] = [x, y]
        this.distancesTo = []
        this.bonds = []
        if (bondWith) {
            this.bonds.push(bondWith)
            bondWith.bonds.push(this)
            this.distancesTo.push(bondWith, 1)
            bondWith.distancesTo.push(this, 1)
            for (let fromBondWithDistanceTo of bondWith.distancesTo) { 
                this.distancesTo.push(new DistanceTo(fromBondWithDistanceTo.atom, fromBondWithDistanceTo.distance + 1))
                fromBondWithDistanceTo.atom.distancesTo.push(new DistanceTo(this, fromBondWithDistanceTo.distance + 1))
            }
            bondWith.molecule.add(this)
        } else {
            this.molecule = new Molecule(this)
        }
    }
    distanceTo(atom) {
        for (let distanceTo of this.distancesTo) {
            if (atom == distanceTo.atom) {
                return distanceTo.distance
            }
        }
        return NaN
    }
}

class Molecule {
    constructor(atom) {
        this.atoms = [atom]
    }
    add(atom) {
        atom.molecule = this
        this.atoms.push(atom)
    }
}

class Chain {
    constructor(start, finish) {
        [this.start, this.finish] = [start, finish]
        if (!start) {
            this.length = 0
            return
        }
        this.length = start.distanceTo(finish)
    }
    findAtoms() {
        this.atoms = [this.finish]
        this.branches = 0
        this.branchPositions = []
        this.firstBranchPosition = Infinity
        let distanceToStart = this.length
        while (distanceToStart > 1) {
            for (let i = 0; i < this.atoms[0].bonds.length; i++) {
                if (this.atoms[0].bonds[i].distanceTo(start) == distanceToStart - 1) {
                    this.atoms.unshift(this.atoms[0].bonds[i])
                    distanceToStart--
                    if (this.atoms[0].bonds.length > 2) {
                        this.branches += this.atoms[0].bonds.length - 2
                        this.branchPositions.unshift(distanceToStart)
                        this.firstBranchPosition = distanceToStart
                    }
                    break
                }
            }
        }
        this.atoms.unshift(start)
    }
}

// upto 50
let names = ['meth', 'eth', 'prop', 'but', 'pent', 'hex', 'hept', 'oct', 'non', 'dec',
    'undec', 'dodec', 'tridec', 'tetradec', 'pentadec', 'hexadec', 'heptadec', 'octadec', 'nonadec', 'icos',
    'henicos', 'docos', 'tricos', 'tetracos', 'pentacos', 'hexacos', 'heptacos', 'ocatcos', 'nonacos', 'triacont',
    'hentriacont', 'dotriacont', 'tritriacont', 'tetratriacont', 'pentatriacont', 'hexatriacont', 'heptatriacont', 'ocattriacont', 'nonatriacont', 'tetracont',
    'hentetracont', 'dotetracont', 'tritetracont', 'tetratetracont', 'pentatetracont', 'hexatetracont', 'heptatetracont', 'ocattetracont', 'nonatetracont', 'pentacont'
]

let multipliers = names.map(e => e + 'a')
multipliers[0] = '' // we don't care about 'mono'
multipliers[1] = 'di'
multipliers[2] = 'tri'
multipliers[3] = 'tetra'

function name(molecule) {
    if (molecule.atoms.length == 1) {
        return "methane"
    }
    let terminalAtoms = []
    for (let i = 0; i < molecule.atoms.length; i++) {
        if (molecule.atoms[i].bonds.length == 1) {
            terminalAtoms.push(molecule.atoms[i])
        }
    }
    
    let longestChains = [new Chain()]
    for (let i = 0; i < terminalAtoms.length; i++) {
        for (let j = 0; j < terminalAtoms.length; i++) {
            if (i !== j) {
                let chain = new Chain(terminalAtoms[i], terminalAtoms[j])
                keepGreatestOnly(longestChains, chain, chain => chain.length)
            }
        }
    }
    
    for (let i = 0; i < longestChains.length; i++) {
        longestChains[i].findAtoms()
    }

    let mostBranchyChains = greatestOnly(longestChains, chain => chain.branches)

    let closestBranchChains = greatestOnly(mostBranchyChains, chain => chain.firstBranchPosition, reverse=true)

    let alphabeticallyFirstBrachChains = greatestOnly(closestBranchChains, chain => lowestClosestBranchName(chain), reverse=true)
    return nameBranches(alphabeticallyFirstBrachChains[0]) + alphabeticallyFirstBrachChains[0].atoms.length + 'ane'
}

function lowestClosestBranchName(chain) {
    /*alphabetically*/lowestBranch = "zzz"
    let branchesFrom = chain.atoms[chain.firstBranchPosition]
    for (let i = 0; i < branchesFrom.bonds.length; i++) {
        if (chain.atoms[chain.firstBranchPosition - 1] !== branchesFrom.bonds[i] && chain.atoms[chain.firstBranchPosition + 1] !== branchesFrom.bonds[i]) {
            let branch = nameBranch(branchesFrom, branchesFrom.bonds[i], rootOnly=true)
            if (branch < lowestBranch) {
                lowestBranch = branch
            }
        }
    }
    return lowestBranch
}

function nameBranch(from, start, rootOnly=false) {

}

function nameBranches(from, start) {
    
}

function greatestOnly(list, greatness, reverse = false) {
    let result = [list[0]]
    for (let i = 1; i < list.length; i++) {
        keepGreatestOnly(result, list[i], greatness, reverse)
    }
    return result
}

function keepGreatestOnly(list, element, greatness, reverse = false) {
    if ((!reverse && greatness(element) > greatness(list[0])) || (reverse && greatness(element) < greatness(list[0]))) {
        list[0] = element
        while (list.length > 1) {
            list.pop()
        }
        return
    }
    if (greatness(element) == greatness(list[0])) {
        list.push(element)
    }
}