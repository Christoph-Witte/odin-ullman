import * as R from 'ramda'
import { normalize } from '../../model/sidc'
import { format } from '../format'
import { styleFactory, defaultStyle, biggerFont } from './default-style'
import * as TS from '../ts'

const quads = 64
const deg2rad = Math.PI / 180
const geometries = {}

const arcText = styles => (anchor, angle, text) => styles.text(anchor, {
  text,
  font: biggerFont,
  flip: true,
  textAlign: () => 'center',
  rotation: Math.PI - angle + 330 / 2 * deg2rad
})

/**
 * TACGRP.TSK.ISL
 * TASKS / ISOLATE
 */
geometries['G*T*E-----'] = ({ styles, points, resolution }) => {
  const delta = 330 * deg2rad
  const coords = TS.coordinates(points)
  const segment = TS.segment(coords)
  const angle = segment.angle()
  const radius = segment.getLength()

  const arcs = [
    TS.arc(coords[0], radius, angle, delta, quads),
    TS.arc(coords[0], 0.8 * radius, angle, delta, quads)
  ]

  const teeth = R.range(1, arcs[0].length)
    .filter(i => i % 5 === 0)
    .map(i => [arcs[0][i - 1], arcs[1][i], arcs[0][i + 1]])
    .map(coords => TS.lineString(coords))

  const xs = TS.projectCoordinates(radius, angle - delta + Math.PI / 2, R.last(arcs[0]))([
    [0.2, -0.2], [0, 0], [0.2, 0.2]
  ])

  const textAnchor = TS.point(arcs[0][Math.floor(arcs[0].length / 2)])
  const geometry = TS.difference([
    TS.union([...teeth, TS.lineString(arcs[0])]),
    TS.pointBuffer(textAnchor)(resolution * 10)
  ])

  return [
    styles.solidLine(TS.union([geometry, TS.lineString(xs)])),
    arcText(styles)(textAnchor, angle, 'I')
  ]
}

/**
 * TACGRP.TSK.OCC
 * TASKS / OCCUPY
 */
geometries['G*T*O-----'] = ({ points, resolution, styles }) => {
  const delta = 330 * deg2rad
  const coords = TS.coordinates(points)
  const segment = TS.segment(coords)
  const angle = segment.angle()
  const radius = segment.getLength()

  const arc = TS.arc(coords[0], radius, angle, delta, quads)

  const xs = TS.projectCoordinates(radius, angle - delta + Math.PI / 2, R.last(arc))([
    [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2], [-0.2, -0.2]
  ])

  const textAnchor = TS.point(arc[Math.floor(arc.length / 2)])
  const geometry = TS.difference([
    TS.lineString(arc),
    TS.pointBuffer(textAnchor)(resolution * 10)
  ])

  return [
    styles.solidLine(TS.union([
      geometry,
      TS.lineString([xs[0], xs[1]]),
      TS.lineString([xs[2], xs[3]])
    ])),
    arcText(styles)(textAnchor, angle, 'O')
  ]
}

/**
 * TACGRP.TSK.RTN
 * TASKS / RETAIN
 */
geometries['G*T*Q-----'] = ({ points, resolution, styles }) => {
  const delta = 330 * deg2rad
  const coords = TS.coordinates(points)
  const segment = TS.segment(coords)
  const angle = segment.angle()
  const radius = segment.getLength()

  const arcs = [
    TS.arc(coords[0], radius, angle, delta, quads),
    TS.arc(coords[0], 0.8 * radius, angle, delta, quads)
  ]

  const spikes = R.range(1, arcs[0].length - 2)
    .filter(i => i % 2 === 0)
    .map(i => [arcs[0][i], arcs[1][i]])
    .map(coords => TS.lineString(coords))

  const xs = TS.projectCoordinates(radius, angle - delta + Math.PI / 2, R.last(arcs[1]))([
    [0.2, -0.2], [0, 0], [0.2, 0.2]
  ])

  const textAnchor = TS.point(arcs[1][Math.floor(arcs[0].length / 2)])
  const geometry = TS.difference([
    TS.union([...spikes, TS.lineString(arcs[1])]),
    TS.pointBuffer(textAnchor)(resolution * 10)
  ])

  return [
    styles.solidLine(TS.union([geometry, TS.lineString(xs)])),
    arcText(styles)(textAnchor, angle, 'R')
  ]
}

/**
 * TACGRP.TSK.SCE
 * TASKS / SECURE
 */
geometries['G*T*S-----'] = ({ points, resolution, styles }) => {
  const delta = 330 * deg2rad
  const coords = TS.coordinates(points)
  const segment = TS.segment(coords)
  const angle = segment.angle()
  const radius = segment.getLength()

  const arc = TS.arc(coords[0], radius, angle, delta, quads)
  const xs = TS.projectCoordinates(radius, angle - delta + Math.PI / 2, R.last(arc))([
    [0.2, -0.2], [0, 0], [0.2, 0.2]
  ])

  const textAnchor = TS.point(arc[Math.floor(arc.length / 2)])
  const geometry = TS.difference([
    TS.lineString(arc),
    TS.pointBuffer(textAnchor)(resolution * 10)
  ])

  return [
    styles.solidLine(TS.union([geometry, TS.lineString(xs)])),
    arcText(styles)(textAnchor, angle, 'S')
  ]
}

const fanLike = label => options => {
  const { resolution, styles, points } = options
  const [C, A, B] = TS.coordinates(points)
  const segmentA = TS.segment([C, A])
  const segmentB = TS.segment([C, B])
  const angleA = segmentA.angle()
  const angleB = segmentB.angle()

  const distance = resolution * 4
  const [A1, A2, B1, B2] = [
    TS.projectCoordinates(distance, angleA, segmentA.pointAlong(0.55))([[0, -1]]),
    TS.projectCoordinates(distance, angleA, segmentA.pointAlong(0.45))([[0, +1]]),
    TS.projectCoordinates(distance, angleB, segmentB.pointAlong(0.55))([[0, +1]]),
    TS.projectCoordinates(distance, angleB, segmentB.pointAlong(0.45))([[0, -1]])
  ].flat()

  const arrowOffsets = [[-0.08, -0.08], [0, 0], [-0.08, 0.08]]
  const arrows = [
    TS.projectCoordinates(segmentA.getLength(), angleA, A)(arrowOffsets),
    TS.projectCoordinates(segmentB.getLength(), angleB, B)(arrowOffsets)
  ]

  const text = segment => styles.text(TS.point(segment.pointAlong(0.3)), {
    rotation: Math.PI - segment.angle(),
    text: label,
    flip: true
  })

  return [
    styles.solidLine(TS.collect([
      TS.lineString([C, A1, A2, A]),
      TS.lineString([C, B1, B2, B]),
      ...arrows.map(coords => TS.lineString(coords))
    ])),
    ...(label ? [TS.segment([C, A1]), TS.segment([C, B1])].map(text) : [])
  ]
}

/**
 * TACGRP.TSK.SEC.SCN
 * TASKS / SCREEN
 */
geometries['G*T*US----'] = fanLike('S')

/**
 * TACGRP.TSK.SEC.GUD
 * TASKS / GUARD
 */
geometries['G*T*UG----'] = fanLike('G')

/**
 * TACGRP.TSK.SEC.COV
 * TASKS / COVER
 */
geometries['G*T*UC----'] = fanLike('C')

/**
 * TACGRP.C2GM.GNL.ARS.SRHARA
 * SEARCH AREA/RECONNAISSANCE AREA
 */
geometries['G*G*GAS---'] = ({ resolution, styles, points }) => {
  const [C, A, B] = TS.coordinates(points)
  const segmentA = TS.segment([C, A])
  const segmentB = TS.segment([C, B])
  const angleA = segmentA.angle()
  const angleB = segmentB.angle()

  const distance = resolution * 4
  const [A1, A2, B1, B2] = [
    TS.projectCoordinates(distance, angleA, segmentA.pointAlong(0.55))([[0, -1]]),
    TS.projectCoordinates(distance, angleA, segmentA.pointAlong(0.45))([[0, +1]]),
    TS.projectCoordinates(distance, angleB, segmentB.pointAlong(0.55))([[0, +1]]),
    TS.projectCoordinates(distance, angleB, segmentB.pointAlong(0.45))([[0, -1]])
  ].flat()

  const arrowOffsets = [[-0.06, -0.03], [0, 0], [-0.06, 0.03], [-0.06, 0], [-0.06, -0.03]]
  const arrows = [
    TS.projectCoordinates(segmentA.getLength(), angleA, A)(arrowOffsets),
    TS.projectCoordinates(segmentB.getLength(), angleB, B)(arrowOffsets)
  ]

  return [
    styles.solidLine(TS.collect([
      TS.lineString([C, A1, A2, arrows[0][3]]),
      TS.lineString([C, B1, B2, arrows[1][3]])
    ])),
    styles.filledPolygon(TS.union(arrows.map(TS.polygon)))
  ]
}

/**
 * TACGRP.MOBSU.CBRN.MSDZ
 * MINIMUM SAFE DISTANCE ZONES
 */
geometries['G*M*NM----'] = ({ feature, styles, points }) => {
  const [C, A] = TS.coordinates(points)
  const segment = TS.segment([C, A])

  const label = feature.get('t')
    ? styles.text(TS.point(A), { text: feature.get('t'), flip: false })
    : []

  return [
    styles.solidLine(TS.pointBuffer(TS.point(C))(segment.getLength())),
    label
  ]
}

/**
 * TACGRP.TSK.SZE
 * TASKS / SEIZE
 */
geometries['G*T*Z-----'] = ({ styles, points, resolution }) => {
  const [C, O, S] = TS.coordinates(points)
  const segmentO = TS.segment([C, O])
  const segmentS = TS.segment([C, S])
  const radius = segmentO.getLength() - segmentS.getLength()

  const [X] = TS.projectCoordinates(radius, segmentO.angle(), O)([[-1, -1]])
  const arcCoords = TS.arc(C, segmentS.getLength(), segmentO.angle(), Math.PI / 2, 32)
  const textAnchor = TS.point(arcCoords[Math.floor(arcCoords.length / 2)])

  const arc = TS.difference([
    TS.lineString(arcCoords),
    TS.pointBuffer(textAnchor)(resolution * 10)
  ])

  const xs = TS.projectCoordinates(segmentS.getLength(), segmentS.angle() + Math.PI / 2, R.last(arcCoords))([
    [0.1, -0.1], [0, 0], [0.1, 0.1]
  ])

  return [
    styles.solidLine(TS.collect([
      arc,
      TS.pointBuffer(TS.point(X))(radius),
      TS.lineString(xs)
    ])),
    styles.wireFrame(TS.union([
      TS.lineString(segmentO),
      TS.lineString(segmentS)
    ])),
    styles.text(textAnchor, {
      text: 'S',
      flip: false
    })
  ]
}

/**
 * TACGRP.MOBSU.OBST.OBSEFT.TUR
 * OBSTACLE EFFECT / TURN
 */
geometries['G*M*OET---'] = ({ styles, points }) => {
  const [C, O] = TS.coordinates(points)
  const segmentO = TS.segment([C, O])

  const arcCoords = TS.arc(C, segmentO.getLength(), segmentO.angle(), Math.PI / 2, 32)

  const arrow = TS.polygon(TS.projectCoordinates(segmentO.getLength(), segmentO.angle(), R.last(arcCoords))([
    [0.2, -0.1], [0, 0], [0.2, 0.1], [0.2, -0.1]
  ]))

  const arc = TS.difference([TS.lineString(arcCoords), arrow])

  return [
    styles.solidLine(
      TS.union([arc, arrow]),
      { fill: styles.fill(options => options.primaryColor) }
    ),
    styles.wireFrame(TS.lineString(segmentO))
  ]
}

export const multipointStyle = mode => (feature, resolution) => {
  const sidc = normalize(feature.getProperties().sidc)
  const geometry = feature.getGeometry()
  const reference = geometry.getFirstCoordinate()
  const { read, write } = format(reference)
  const points = read(geometry)
  const factory = styleFactory({ mode, feature, resolution })(write)
  const options = { feature, resolution, points, styles: factory }

  return [
    geometries[sidc] ? geometries[sidc](options).flat() : defaultStyle(feature),
    factory.handles(points)
  ].flat()
}
