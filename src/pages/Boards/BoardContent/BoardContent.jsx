import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'
import { generatePlaceholderCard } from '~/utils/formatters'
import {
  DndContext,
  // PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  // closestCenter,
  pointerWithin,
  // rectIntersection,
  getFirstCollision
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useState, useCallback, useRef } from 'react'
import { cloneDeep, isEmpty } from 'lodash'

import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoxContent({ board }) {
  // https://docs.dndkit.com/api-documenta...
  // Nếu dùng pointerSensor mặc định thì phải kết hợp với thuộc tính css touch-action: none ở những phần tử kéo thả - nhưng mà còn bug
  // const pointerSensor = useSensor(PointerSensor, {
  //   activationConstraint: { distance: 10 },
  // });
  // Yêu cầu chuột di chuyển 10px thì mới kích hoạt event, fix trường hợp click bị gọi event
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 }
  })

  // Nhấn giữ 250ms và dung sai của cảm ứng 500px thì mới kích hoạt event
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 500 }
  })

  // Ưu tiên sử dụng kết hợp 2 loại sensors là mouse và touch để có trải nghiệm trên mobile tốt nhất, không bị bug
  // const sensors = useSensors(pointerSensor);
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] = useState([])

  //Cùng 1 thời điểm chỉ có một phần tử dạng được kéo thả (column hoặc card)
  const [activeDragItemId, setactiveDragItemId] = useState([null])
  const [activeDragItemType, setactiveDragItemType] = useState([null])
  const [activeDragItemData, setactiveDragItemData] = useState([null])
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState([
    null
  ])

  //Điểm va chạm cuối cùng(xử lý thuật toán phát hiện va chạm)
  const lastOverId = useRef(null)
  useEffect(() => {
    const orderedColumns = mapOrder(
      board?.columns,
      board?.columnOrderIds,
      '_id'
    )
    setOrderedColumns(orderedColumns)
  }, [board])

  //Tìm column theo cardId
  const findColumnByCardId = (cardId) => {
    //Đoạn này cần lưu ý, nên dùng c.cards thay vì c.cardOrderIds bởi vì bước handleDragOver chúng ta sẽ làm dữ liệu cho cards hoàn chỉnh trước rồi mới tạo ra cardOrderIds mới
    return orderedColumns.find((column) =>
      column.cards.map((card) => card._id)?.includes(cardId)
    )
  }

  //Function chung xử lí việc Cập nhật lại state trong trường hợp di chuyển card giữa các column khác nhau
  const moveCardBetweenDifftentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData
  ) => {
    setOrderedColumns((prevColums) => {
      //Tìm vị trị (index) của overcard trong column đích(nơi mà active card đang kéo qua)
      const overCardIndex = overColumn?.cards?.findIndex(
        (card) => card._id === overCardId
      )

      //Logic tính toán 'cardIndex mới' (trên hoặc dưới của overCard) lấy chuẩn ra từ code của thư viện dnd-kit
      let newCardIndex
      const isBelowOverItem =
        active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0
      newCardIndex =
        overCardIndex >= 0
          ? overCardIndex + modifier
          : overColumn?.cards?.length + 1

      //Clone mảng OrderColumnsState cũ ra một cái mới để xử lý dữ liệu rồi return - cập nhật lại orderedColumnsState mới
      const nextColumns = cloneDeep(prevColums)
      const nextActiveColumn = nextColumns.find(
        (column) => column._id === activeColumn._id
      )
      const nextOverColumn = nextColumns.find(
        (column) => column._id === overColumn._id
      )

      // Column cũ
      if (nextActiveColumn) {
        // Xóa card ở column active (cũng có thể hiểu là column cũ, cái lúc mà kéo card ra khỏi nó để sang column khác)
        nextActiveColumn.cards = nextActiveColumn.cards.filter(
          (card) => card._id !== activeDraggingCardId
        )

        //Thêm placeholderCard nếu column rỗng: bị kéo card đi, ko còn cái nào nữa
        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]
        }
        //cập nhật lại cardOrderIds cho chuẩn dữ liệu
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(
          (card) => card._id
        )
      }

      // Column mới
      if (nextOverColumn) {
        //Kiểm tra xem card đang kéo có tồng tại trong column đích hay không, nếu có thì cần xóa nó trước
        nextOverColumn.cards = nextOverColumn.cards.filter(
          (card) => card._id !== activeDraggingCardId
        )
        //Phải cập nhật lại chuẩn dữ liệu cho card đang kéo sau khi kéo card giữa 2 column khác nhau
        // const rebuild_activeDraggingCardData = {
        //   ...activeDraggingCardData,
        //   columnId: nextOverColumn._id
        // }
        //Thêm card đang kéo vào overColumn theo vị trí index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id
        })

        // Xóa cái placeholder đi khi đang tồn tại
        nextOverColumn.cards = nextOverColumn.cards.filter(
          (card) => !card.FE_PlaceholderCard
        )

        //cập nhật lại cardOrderIds cho chuẩn dữ liệu
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(
          (card) => card._id
        )
      }

      //Trả về danh sách board mới
      return nextColumns
    })
  }

  //Trigger Khi bắt đầu kéo 1 phần thử
  const handleDragStart = (event) => {
    // console.log("handleDragStart: ", event)
    setactiveDragItemId(event?.active?.id)
    setactiveDragItemType(
      event?.active?.data?.current?.columnId
        ? ACTIVE_DRAG_ITEM_TYPE.CARD
        : ACTIVE_DRAG_ITEM_TYPE.COLUMN
    )
    setactiveDragItemData(event?.active?.data?.current)
    //Nếu là kéo card thì mới thực hiện hành động set giá trị cho oldColumnWhenDraggingCard
    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }

  //Trigger khi kéo qua 1 phần tử khác
  const handleDragOver = (event) => {
    // Không làm gì thêm nếu đang kéo column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return

    //Còn nếu kéo card thì xử lý thêm để có thể kéo card qua lại giữa các column
    // console.log('handleDragOver: ', event)
    const { active, over } = event

    //Cần đảm bảo nếu không tồn tại active hoặc over (khi kéo ra khỏi phạm vi container) thì không làm gì cả(tránh crash trang)
    if (!over || !active) return

    // activeDraggingCard: là card đang kéo
    const {
      id: activeDraggingCardId,
      data: { current: activeDraggingCardData }
    } = active
    //overCard: là card đang tương tác trên hoặc dưới so với cái card được kéo ở trên
    const { id: overCardId } = over

    //Tìm 2 cái columns theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    //Nếu không tồn tại 1 trong 2 thì không làm gì hết, tránh crash trang we
    if (!activeColumn || !overColumn) return

    //Xử lý logic ở đây chỉ khi kéo card qua 2 column khác nhau, còn nếu kéo card trong chính column ban đầu của no thì không làm gì cả
    // Vì đây là đoạn xử lý lúc kéo (handleDarkOver) nên chỉ cần xử lý khi kéo qua column khác
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifftentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData
      )
    }
  }

  //Trigger khi kết thúc hành động keó (drag) 1 phần tử => hành động thả (drop)
  const handleDragEnd = (event) => {
    // console.log('handleDragEnd: ', event)

    const { active, over } = event

    //Cần đảm bảo nếu không tồn tại active hoặc over (khi kéo ra khỏi phạm vi container) thì không làm gì cả(tránh crash trang)
    if (!over || !active) return

    //Xử lý kéo thả card
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      // activeDraggingCard: là card đang kéo
      const {
        id: activeDraggingCardId,
        data: { current: activeDraggingCardData }
      } = active
      //overCard: là card đang tương tác trên hoặc dưới so với cái card được kéo ở trên
      const { id: overCardId } = over

      //Tìm 2 cái columns theo cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      //Nếu không tồn tại 1 trong 2 thì không làm gì hết, tránh crash trang web
      if (!activeColumn || !overColumn) return

      //Kéo card qua 2 column khác nhau
      //Phải dùng tới activeDragItemData hoặc oldColumnWhenDraggingCard._id(set vào state từ bước handleDragStart) chứu không phải activeDât trong scope handleDragEnd vì sau khi đi qua onDragOver thì state của card đã bị cập nhật 1 lần rồi
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        moveCardBetweenDifftentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData
        )
      } else {
        //Hành động kéo thả card trong cùng 1 column
        //Lấy vị trí cũ từ oldColumnWhenDraggingCard
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(
          (c) => c._id === activeDragItemId
        )
        //Lấy vị trí mới từ over
        const newCardIndex = overColumn?.cards?.findIndex(
          (c) => c._id === overCardId
        )
        //Dung arrayMove của dnd-kit để sắp xếp lại mảng card ban đầu tương tự như sắp xếp column
        const dndOrderedCard = arrayMove(
          oldColumnWhenDraggingCard?.cards,
          oldCardIndex,
          newCardIndex
        )
        setOrderedColumns((prevColumns) => {
          //Clone mảng OrderColumnsState cũ ra một cái mới để xử lý dữ liệu rồi return - cập nhật lại orderedColumnsState mới
          const nextColumns = cloneDeep(prevColumns)
          //Tìm tới column mà chúng ta đang thả
          const targetColumn = nextColumns.find(
            (column) => column._id === overColumn._id
          )
          //Cập nhật lại 2 giá trị mới là card và cardOrderIds trong cái tergetColumn
          targetColumn.cards = dndOrderedCard
          targetColumn.cardOrderIds = dndOrderedCard.map((card) => card._id)
          // console.log('targetColumn', targetColumn)
          //Trả về giá trị state mới sau khi kéo thả card (chuẩn vị trí)
          return nextColumns
        })
      }
    }

    //Xử lý kéo thả column trong boardContent
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      //Nếu vị trí sau khi kéo thả khác với vị trí ban đầu
      if (active.id !== over.id) {
        //Lấy vị trí cũ từ active
        const oldColumnIndex = orderedColumns.findIndex(
          (c) => c._id === active.id
        )
        //Lấy vị trí mới từ over
        const newColumnIndex = orderedColumns.findIndex(
          (c) => c._id === over.id
        )
        //Dùng arrayMove của dnd-kit để sắp xếp lại mảng column ban đầu
        //Code của arrayMove ở đây: dnd-kit/packages/sortable/src/utilites/arrayMove.ts
        const dndOrderedColumn = arrayMove(
          orderedColumns,
          oldColumnIndex,
          newColumnIndex
        )
        // Dùng để xử lý gọi API
        // const dndOrderedColumnIds = dndOrderedColumn.map((c) => c._id);
        // console.log("dndOrderedColumn", dndOrderedColumn);
        // console.log("dndOrderedColumnIds", dndOrderedColumnIds);

        // Cập nhật lại state columns ban đầu sau khi kéo thả
        setOrderedColumns(dndOrderedColumn)
      }
    }

    //Những dữ liệu sau khi kéo thả xong thì cần reset lại
    setactiveDragItemId(null)
    setactiveDragItemType(null)
    setactiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }

  /*
  Animation khi thả (drop) phần tử - Test bằng cách kéo xong thả trực tiếp và nhìn vào phần giữ chỗ overlay
  */
  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5'
        }
      }
    })
  }

  //Chúng ta sẽ custom lại chiến lược / thuật toán phát hiện va chạm tối ưu cho việc kéo thả card giữa nhiều columns
  //args = arguments = các tham số truyền vào, đối số
  const collisionDetectionStrategy = useCallback(
    (args) => {
      //Trường hợp kéo column thì dùng thuật toán closestCorner là chuẩn nhất
      if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
        return closestCorners({ ...args })
      }

      //Tìm các điểm giao nhau, va chạm - intersection với con trỏ
      const pointerIntersection = pointerWithin(args)

      //Tìm các điểm giao nhau, va chạm, trả về 1 mảng các va chạm - intersictions với con trỏ
      //Nếu pointerIntersection là mảng rỗng, return luôn ko cần làm gì hết
      //Fix triệt để cái bug flickering của thư viện dnd-kit trong trường hợp sau:
      //Kéo một cái card có img cover và kéo lên phí trên cùng ra khỏi khu vực kéo thả
      if (!pointerIntersection?.length) return

      //Thuật toán phát hiện va chạm sẽ trả về 1 mảng các va chạm ở đây (không cần bước này nữa - video 37.1)
      // const intersections = !!pointerIntersection?.length
      //   ? pointerIntersection
      //   : rectIntersection(args)

      //Tìm overId đầu tiên trong đám pointerIntersection ở trên
      let overId = getFirstCollision(pointerIntersection, 'id')
      //
      if (overId) {
        //nếu cái over nó là column thì sẽ tìm tới cái cardId gần nhất bên trong khu vực va chạm đó dựa vào thuật toán phát hiện va chạm closestCent hoặc closestCorner đều được. Tuy nhiên ở đây dùng closesCenter mượt hơn
        const checkColumn = orderedColumns.find(
          (column) => column._id === overId
        )
        if (checkColumn) {
          // console.log('OverId Before', overId)
          overId = closestCorners({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (container) => {
                return (
                  container.id !== overId &&
                  checkColumn?.cardOrderIds?.includes(container.id)
                )
              }
            )
          })[0]?.id
          // console.log('OverId After', overId)
        }
        lastOverId.current = overId
        return [{ id: overId }]
      }
      //Nếu overId là null thì trả về null rỗng - tránh bị bug trang
      return lastOverId.current ? [{ id: lastOverId.current }] : []
    },
    [activeDragItemType, orderedColumns]
  )

  return (
    <DndContext
      //Cảm biến
      sensors={sensors}
      //Thuật toán phát hiện va chạm (nếu không có nó thì card với cover lớn sẽ không kéo qua column được vì lúc này nó đang bị conflict giữa card và column), chúng ta sẽ dùng cloestCorners thay vì closestCenter
      //https://docs.dndkit.com/api-documentation/context-provider/collision-detection-algorithms
      //Nếu chỉ dùng closestCorner sẽ có bug flickering + sai lệch dữ liệu
      // collisionDetection={closestCorners}

      //Tự custom nâng cao thuật toán phát hiện va chạm
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box
        sx={{
          width: '100%',
          height: (theme) => theme.trello.boardContentHeight,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? '#34495e' : '#1976d2',
          p: '10px 0'
        }}
      >
        <ListColumns columns={orderedColumns} />
        <DragOverlay dropAnimation={customDropAnimation}>
          {!activeDragItemType && null}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && (
            <Column column={activeDragItemData} />
          )}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && (
            <Card card={activeDragItemData} />
          )}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoxContent
