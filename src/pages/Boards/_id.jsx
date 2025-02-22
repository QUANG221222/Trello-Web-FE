import { useState, useEffect } from 'react'
import { Container } from '@mui/material'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import { mapOrder } from '~/utils/sorts'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

// import { mockData } from '~/apis/mock-data'
import {
  fetchBoardDetailsAPI,
  createNewColumnAPI,
  createNewCardAPI,
  updateBoardDetailsAPI,
  updateColumnDetailsAPI,
  moveCardToDiffrentColumnAPI
} from '~/apis'
import { generatePlaceholderCard } from '~/utils/formatters'
import { isEmpty } from 'lodash'

function Board() {
  const [board, setBoard] = useState(null)
  useEffect(() => {
    // Tạm thời fix cứng boardId, flow chuẩn chỉnh về sau khi học nâng cao trực tiếp, chúng ta sẽ sử dụng react-router-dom để lấy boardId từ URL
    const boardId = '67a86a4bd6388a26c2404a8b'
    //Call API
    fetchBoardDetailsAPI(boardId).then((board) => {
      //Sắp xếp thứ tự column luôn ở đây trước khi đưa dữ liệu xuống bên dưới các component con ( video 71 đã giải thích lý do ở phần Fix bug quan trọng )
      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id')

      board.columns.forEach((column) => {
        // Cần xử lý vấn đến kéo thả một column rỗng (placeholder card)
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        } else {
          // Sắp xếp thứ tự cards luôn ở đây trước khi đưa dữ liệu xuống bên dưới các component con ( video 71 đã giải thích lý do ở phần Fix bug quan trọng )
          column.cards = mapOrder(column.cards, column.cardOrderIds, '_id')
        }
      })

      setBoard(board)
    })
  }, [])

  //Func này có nhiệm vụ gọi API tạo mới column và làm lại state board
  const createNewColumn = async (newColumnData) => {
    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id
    })

    // Khi tạo column mới thì nó sẽ chưa có carrd, cần xử lý vấn đề kéo thẻ vào một column rỗng (nhớ lại video 37.2, code hiện tại là video 69)
    createdColumn.cards = [generatePlaceholderCard(createdColumn)]
    createdColumn.cardOrderIds = [generatePlaceholderCard(createdColumn)._id]

    // Cập nhật lại State Board
    // Phía Frontend chúng ta phải tự làm đúng lại state board(thay vì phải gọi lại api fecthBoardDetailsAPI)
    // Lưu ý: cách làm này phụ thuộc vào tùy lựa chọn và đặc thù của dự án, có nơi thì BE sẽ hỗ trợ trả về luôn toàn bộ board dù đây có là api tạo Column hay Card đi chăng nữa => Lúc này FE nhàn hơn.
    const newBoard = { ...board }
    newBoard.columns.push(createdColumn)
    newBoard.columnOrderIds.push(createdColumn._id)
    setBoard(newBoard)
  }

  //Func này có nhiệm vụ gọi API tạo mới card và làm lại state board
  const createNewCard = async (newCardData) => {
    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id
    })
    // console.log('createdCard: ', createdCard)

    // Cập nhật lại State Board
    // Phía Frontend chúng ta phải tự làm đúng lại state board(thay vì phải gọi lại api fecthBoardDetailsAPI)
    // Lưu ý: cách làm này phụ thuộc vào tùy lựa chọn và đặc thù của dự án, có nơi thì BE sẽ hỗ trợ trả về luôn toàn bộ board dù đây có là api tạo Column hay Card đi chăng nữa => Lúc này FE nhàn hơn.
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(
      (column) => column._id === createdCard.columnId
    )
    // Nếu column rống: bản chất là đang chứa 1 cái placeholder card
    if (columnToUpdate.cards.some((card) => card.FE_PlaceholderCard)) {
      columnToUpdate.cards = [createdCard]
      columnToUpdate.cardOrderIds = [createdCard._id]
    } else {
      // Ngược lại nếu column có data thì push vào cuối mảng
      columnToUpdate.cards.push(createdCard)
      columnToUpdate.cardOrderIds.push(createdCard._id)
    }
    setBoard(newBoard)
  }

  /**
   * Func này có nhiệm vụ gọi API và xử lý khi kéo thả xong xuôi
   * Chỉ cần gọi API để cập nhật mảng OrderedColumnIds của Board chứa nó (thay đổi vị trí trong mảng)
   */
  const moveColumns = (dndOrderedColumns) => {
    // Update cho chuẩn dữ liệu state Board
    const dndOrderedColumnIds = dndOrderedColumns.map((c) => c._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnIds
    setBoard(newBoard)

    // Gọi API Update Board
    updateBoardDetailsAPI(newBoard._id, {
      columnOrderIds: dndOrderedColumnIds
    })
  }

  /**
   * Khi di chuyển card trong cùng column:
   * Chỉ cần gọi API để cập nhật mảng cardOrderIds của column chứa nó (thay đổi vị trí trong mảng)
   */
  const moveCardInTheSameColumn = (
    dndOrderedCard,
    dndOrderedCardIds,
    columnId
  ) => {
    // Update cho chuẩn dữ liệu state Board
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(
      (column) => column._id === columnId
    )
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCard
      columnToUpdate.cardOrderIds = dndOrderedCardIds
    }
    setBoard(newBoard)

    // Gọi API Update Board
    updateColumnDetailsAPI(columnId, { cardOrderIds: dndOrderedCardIds })
  }

  /**
   * Khi di chuyển card sang column khác:
   * B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (Hiểu bản chất là xóa cái _id của card ra khỏi mảng)
   * B2: Cập nhật mảng cardOrderIds của column tiếp theo (Hiểu bản chất là thêm cái _id của card vào mảng)\
   * B3: Cập nhật lại trường ColumnId mới của card đã kéo
   * => Làm một API support riêng.
   */
  const moveCardToDiffrentColumn = (
    currentCardId,
    prevColumnId,
    nextColumnId,
    dndOrderedColumns
  ) => {
    // Update cho chuẩn dữ liệu state Board
    const dndOrderedColumnIds = dndOrderedColumns.map((c) => c._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnIds
    setBoard(newBoard)

    // Gọi API xử lý phía BE
    let prevCardOrderIds = dndOrderedColumns.find(
      (c) => c._id === prevColumnId
    )?.cardOrderIds
    // Xử lý vấn đề khi kéo phần tử card cuối cùng ra khỏi column. Column rỗng sẽ có placeholder-card cần xóa đi trước ghi gửi dữ liệu lên phía BE. (Nhớ lại video 37.2)
    if (prevCardOrderIds[0].includes('placeholder-card')) prevCardOrderIds = []
    moveCardToDiffrentColumnAPI({
      currentCardId,
      prevColumnId,
      prevCardOrderIds: prevCardOrderIds,
      nextColumnId,
      nextCardOrderIds: dndOrderedColumns.find((c) => c._id === nextColumnId)
        ?.cardOrderIds
    })
  }

  if (!board) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          gap: 1
        }}
      >
        <CircularProgress />
        <Typography>Loading Board...</Typography>
      </Box>
    )
  }
  return (
    <Container disableGutters maxWidth="false" sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={board} />
      <BoardContent
        board={board}
        createNewColumn={createNewColumn}
        createNewCard={createNewCard}
        moveColumns={moveColumns}
        moveCardInTheSameColumn={moveCardInTheSameColumn}
        moveCardToDiffrentColumn={moveCardToDiffrentColumn}
      />
    </Container>
  )
}

export default Board
