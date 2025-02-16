import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import FilterListIcon from '@mui/icons-material/FilterList'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { capitalizeFirstLetter } from '~/utils/formatters'

const MENU_STYLES = {
  color: 'white',
  bgcolor: 'transparent',
  border: 'none',
  p: '5px',
  borderRadius: '4px',
  '.MuiSvgIcon-root': { color: 'white' },
  '&:hover': {
    bgcolor: 'primary.50'
  }
}

function BoardBar({ board }) {
  // const { board } = props;
  // const board = props.board
  return (
    <Box
      px={2}
      sx={{
        width: '100%',
        height: (theme) => theme.trello.boardBarHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        overflowX: 'auto',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Tooltip title={board?.description}>
          <Chip
            sx={MENU_STYLES}
            icon={<DashboardIcon />}
            label={board?.title}
            clickable
          />
        </Tooltip>
        <Chip
          sx={MENU_STYLES}
          icon={<VpnLockIcon />}
          label={capitalizeFirstLetter(board?.type)}
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<AddToDriveIcon />}
          label="Add To Google Drive"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<BoltIcon />}
          label="Automation"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<FilterListIcon />}
          label="Filters"
          clickable
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          sx={{
            color: 'white',
            fontWeight: '400',
            borderColor: 'dark',
            '&:hover': { borderColor: 'white' }
          }}
          variant="outlined"
          startIcon={<PersonAddIcon />}
        >
          Invite
        </Button>
        <AvatarGroup
          max={7}
          sx={{
            gap: '10px',
            '& .MuiAvatar-root': {
              width: 34,
              height: 34,
              fontSize: '16px',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              '&:first-of-type': { bgcolor: '#a4b0be' }
            }
          }}
        >
          <Tooltip title="QUANGCODER">
            <Avatar
              alt="QUANGCODER"
              src="https://scontent.fsgn5-3.fna.fbcdn.net/v/t39.30808-1/354658639_975869983546592_9023835637326355922_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=104&ccb=1-7&_nc_sid=e99d92&_nc_eui2=AeGbHlZ9KnR3iAPUq6Uwro6ZtWR7zTBZO0W1ZHvNMFk7RRBioxcDEXxiCwmj31HTF-TmBXm_R4G6atbgmsgsfHo8&_nc_ohc=yqfyUTMdHIAQ7kNvgEuPTr8&_nc_oc=Adg5gogPMcVZHmJvVvjhHCnreVc-fMeBgKg7yR1VokQwAgni87arnKPFUXSH4sfBCbXBhKPBwTX1ibn86HHLrzo0&_nc_zt=24&_nc_ht=scontent.fsgn5-3.fna&_nc_gid=Ax3JcyS9TUxsr2wcKX2gHvU&oh=00_AYC4OgK4aJEAH4UeKTfH7oROb-cW6nOFjeWZA14Tm2ptxw&oe=67B36CDC"
            />
          </Tooltip>
          <Tooltip title="QUANGCODER">
            <Avatar
              alt="THUANCODER"
              src="https://scontent.fsgn5-10.fna.fbcdn.net/v/t39.30808-1/471259906_598232982693659_6072574380158195980_n.jpg?stp=c0.0.722.722a_dst-jpg_s200x200_tt6&_nc_cat=110&ccb=1-7&_nc_sid=e99d92&_nc_eui2=AeErMEmYieYhEP9H1ywEUCHzCbMyIgvuzusJszIiC-7O6yJ6vfdhvAcP5ZbLX7CoI7QTgTj-f6rtVN2iTlA2TuOW&_nc_ohc=KjlwO_0UjIMQ7kNvgF7xsK1&_nc_oc=Adj1E0v1N7FFUJixXksBSjOLOFtaX6bsu7ywY38ub4D8TPMtWbHfsiJXh8WlHM0u83AGCg4aTRbYYkz8vQrNkU3i&_nc_zt=24&_nc_ht=scontent.fsgn5-10.fna&_nc_gid=APXkOwUF3xdYHTQG6rwu1WK&oh=00_AYCVldylJ1Xvt7EfVED3I4GJTAOsa2mkh6HChUN3FggnGw&oe=67B342BB"
            />
          </Tooltip>
          <Tooltip title="QUANGCODER">
            <Avatar
              alt="KHOICODER"
              src="https://scontent.fsgn5-15.fna.fbcdn.net/v/t39.30808-1/473117568_1193216432372195_8869993490435359126_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=101&ccb=1-7&_nc_sid=e99d92&_nc_eui2=AeH4-JZYpPN-O5KZGeTXpq8e4mpq6QDbv3jiamrpANu_eCnfU2d4qikK6Z8OIR5FudbnDTyi46vgQSbOLoKup03s&_nc_ohc=kboJwAXyQqYQ7kNvgFiqovS&_nc_oc=AdgYrGl3h3Rb-mQz10B1ssKAnaUIcsWhMttZjIKTfpmLtXeoFWidr0PMxMlvsGN7C3jMAaGBdqU9ch9k9osZxfLU&_nc_zt=24&_nc_ht=scontent.fsgn5-15.fna&_nc_gid=A-9YXJRRSaO5YuJInmmo8L_&oh=00_AYAAxmP8tgK9Tj-BpluMcXSnUI7RnnkMly7Jo-N70DQIQw&oe=67B362DF"
            />
          </Tooltip>
          <Tooltip title="QUANGCODER">
            <Avatar
              alt="VICODER"
              src="https://scontent.fsgn5-10.fna.fbcdn.net/v/t39.30808-1/479220420_122106618044761984_2854291649751113091_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=107&ccb=1-7&_nc_sid=e99d92&_nc_eui2=AeHhqjiHVznjlUnfKkq2Zo6_H9qN1N4rB_If2o3U3isH8mvW3XTHFfJc-1E5Tq0uY5nivq90pXoLBi32b0ZH7OIl&_nc_ohc=NUjV3XTaUrcQ7kNvgFSjuHE&_nc_oc=AdizMExu48Adggj6UA2Os-PhHjq7ZxQbLbv5GNQayw-HcFQaFw5qJ0NS4Xfxi0yExcNQFXmP01h3JzyFCtxA0zZH&_nc_zt=24&_nc_ht=scontent.fsgn5-10.fna&_nc_gid=A-CeoTMSgSGk0tEglyLq0YZ&oh=00_AYC6IwKHPpt-WbtgDaVCNSRnJ895DHO76mCNeMtxsTQpvw&oe=67B344CA"
            />
          </Tooltip>
          <Tooltip title="QUANGCODER">
            <Avatar
              alt="HUNGCODER"
              src="https://scontent.fsgn5-15.fna.fbcdn.net/v/t39.30808-1/473077583_2037573093372197_4220613125593586935_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=111&ccb=1-7&_nc_sid=e99d92&_nc_eui2=AeGSMkx_QIIuwkg-rH5qiY-2SoGASIpFK0tKgYBIikUrS3tEoDLQEq34PsP1cElKV0roLDqCLGgEU7HyTy8H2hEK&_nc_ohc=DZpWPOkkV1AQ7kNvgEw5oB2&_nc_oc=AdiyEMIFV-Vr7l0oNdJQ3blDlKoPDAJttjrp3Ncn1_tRzHZ5uJRphOLcUd5uhd-09fNFhB00GfhztTEDJpRjkirv&_nc_zt=24&_nc_ht=scontent.fsgn5-15.fna&_nc_gid=APBi5ZvnSS5ZdJgTSSsUt2m&oh=00_AYCH_o8D3D6ivDZna35TWtA1pS7mNpUwozfS6r-7wRGvpg&oe=67B3581F"
            />
          </Tooltip>
          <Tooltip title="TOANCODER">
            <Avatar
              alt="QUANGCODER"
              src="https://scontent.fsgn5-9.fna.fbcdn.net/v/t39.30808-1/471191131_122107155698681401_9195912087416625225_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=102&ccb=1-7&_nc_sid=1d2534&_nc_eui2=AeFq_JsNuisYU8vA8x-8URLWOlNWiSf7XYM6U1aJJ_tdg619z0mO70v0D1CkBGw-9ivt9UEZWL4nlIZBW_9Bp8kS&_nc_ohc=hmvUKB9MviAQ7kNvgGh99JW&_nc_oc=AdjgbHGFZ8MnLNxFq9HVjAiuVtwkZUMNe6Of-Ml6lzyuERhrH_ANSTrRzdwTWnEaWtPfbPq54lN7IRiBNZ3qSZDH&_nc_zt=24&_nc_ht=scontent.fsgn5-9.fna&_nc_gid=A5gKYQveXPeqLPIM6Jtqkju&oh=00_AYD_Zx9agabeiap8vBEQmg5xv5WgqAjl7pLbyntEtHPCgQ&oe=67B36F5C"
            />
          </Tooltip>
          <Tooltip title="QUANGCODER">
            <Avatar
              alt="QUANGCODER"
              src="https://avatars.githubusercontent.com/u/151104129?v=4"
            />
          </Tooltip>
          <Tooltip title="QUANGCODER">
            <Avatar
              alt="QUANGCODER"
              src="https://avatars.githubusercontent.com/u/151104129?v=4"
            />
          </Tooltip>
          <Tooltip title="QUANGCODER">
            <Avatar
              alt="QUANGCODER"
              src="https://avatars.githubusercontent.com/u/151104129?v=4"
            />
          </Tooltip>
          <Tooltip title="QUANGCODER">
            <Avatar
              alt="QUANGCODER"
              src="https://avatars.githubusercontent.com/u/151104129?v=4"
            />
          </Tooltip>
        </AvatarGroup>
      </Box>
    </Box>
  )
}

export default BoardBar
