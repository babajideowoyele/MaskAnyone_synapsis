import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { visuallyHidden } from '@mui/utils';
import {Chip, IconButton, keyframes, LinearProgress, Link as MuiLink, Tooltip} from '@mui/material';
import {useDispatch, useSelector} from "react-redux";
import Selector from "../state/selector";
import {Job} from "../state/types/Job";
import {Link} from "react-router-dom";
import Paths from "../paths";
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteJobDialog from "../components/runs/DeleteJobDialog";
import Command from "../state/actions/command";

const statusColors: { [status: string]: "default"|"info"|"success"|"error"|"warning" } = {
    'open': 'default',
    'running': 'info',
    'finished': 'success',
    'failed': 'error',
};

const jobTypeLabels: Record<string, string> = {
    'basic_masking': 'Basic Masking',
    'sam2_masking': 'SAM2 Masking',
};

const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
};

const getElapsedMs = (job: Job): number | null => {
    if (!job.startedAt) return null;
    const end = job.finishedAt ?? new Date();
    return end.getTime() - job.startedAt.getTime();
};

const getEstimatedRemainingMs = (job: Job): number | null => {
    if (job.status !== 'running' || !job.startedAt || job.progress <= 0) return null;
    const elapsed = new Date().getTime() - job.startedAt.getTime();
    const totalEstimated = elapsed / (job.progress / 100);
    return Math.max(0, totalEstimated - elapsed);
};

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Job | 'actions' | 'duration';
  label: string;
  sortable?: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'status',
    disablePadding: false,
    label: 'Status',
    sortable: true,
  },
  {
    id: 'videoId',
    disablePadding: false,
    label: 'Video',
    sortable: true,
  },
  {
    id: 'type',
    disablePadding: false,
    label: 'Type',
    sortable: true,
  },
  {
    id: 'createdAt',
    disablePadding: false,
    label: 'Created',
    sortable: true,
  },
  {
    id: 'progress',
    disablePadding: false,
    label: 'Progress',
    sortable: true,
  },
  {
    id: 'duration',
    disablePadding: false,
    label: 'Duration / ETA',
  },
  {
    id: 'actions',
    disablePadding: false,
    label: '',
  }
];

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Job) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler =
    (property: keyof Job) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.sortable ? (
              <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : 'asc'}
                  onClick={createSortHandler(headCell.id as keyof Job)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const JobDurationCell = ({ job }: { job: Job }) => {
    const [, setTick] = React.useState(0);

    React.useEffect(() => {
        if (job.status !== 'running') return;
        const interval = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [job.status]);

    const elapsed = getElapsedMs(job);
    const remaining = getEstimatedRemainingMs(job);

    if (job.status === 'open') {
        return (
            <Typography variant="body2" color="text.secondary">
                Queued
            </Typography>
        );
    }

    return (
        <Box component="div">
            {elapsed !== null && (
                <Typography variant="body2" sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.8125rem' }}>
                    {formatDuration(elapsed)}
                </Typography>
            )}
            {remaining !== null && job.status === 'running' && (
                <Typography variant="caption" color="text.secondary">
                    ~{formatDuration(remaining)} remaining
                </Typography>
            )}
            {job.status === 'finished' && job.startedAt && job.finishedAt && (
                <Typography variant="caption" color="text.secondary">
                    Completed
                </Typography>
            )}
            {job.status === 'failed' && (
                <Typography variant="caption" color="error">
                    Failed
                </Typography>
            )}
        </Box>
    );
};

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

const getProgressPhase = (progress: number, status: string): { label: string; color: string } => {
    if (status === 'finished') return { label: 'Done', color: 'success.main' };
    if (status === 'failed') return { label: 'Failed', color: 'error.main' };
    if (status === 'open') return { label: 'Queued', color: 'text.secondary' };
    if (progress <= 5) return { label: 'Loading', color: 'info.main' };
    if (progress <= 30) return { label: 'Segmenting', color: 'warning.main' };
    if (progress <= 45) return { label: 'Processing', color: 'info.main' };
    if (progress <= 55) return { label: 'Pose estimation', color: 'info.main' };
    return { label: 'Rendering', color: 'success.main' };
};

const JobProgressCell = ({ job }: { job: Job }) => {
    if (job.status === 'open') {
        return (
            <Tooltip title="Waiting for available worker">
                <Box component="div" sx={{ minWidth: 160 }}>
                    <LinearProgress variant="indeterminate" sx={{ height: 6, borderRadius: 3 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Queued
                    </Typography>
                </Box>
            </Tooltip>
        );
    }

    const phase = getProgressPhase(job.progress, job.status);
    const isSegmenting = job.status === 'running' && job.progress > 5 && job.progress <= 30;

    return (
        <Box component="div" sx={{ minWidth: 160 }}>
            <Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                    variant="determinate"
                    value={job.progress}
                    sx={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            transition: 'transform 0.8s ease',
                        },
                    }}
                />
                <Typography
                    variant="body2"
                    sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.8125rem', minWidth: 40, textAlign: 'right' }}
                >
                    {Math.round(job.progress)}%
                </Typography>
            </Box>
            {job.status === 'running' && (
                <Typography
                    variant="caption"
                    sx={{
                        mt: 0.5,
                        display: 'block',
                        color: phase.color,
                        fontFamily: '"IBM Plex Mono", monospace',
                        fontSize: '0.6875rem',
                        animation: isSegmenting ? `${pulse} 2s ease-in-out infinite` : 'none',
                    }}
                >
                    {phase.label}...
                </Typography>
            )}
        </Box>
    );
};

const RunsPage = () => {
  const dispatch = useDispatch();
  const jobs = useSelector(Selector.Job.jobList);
  const videos = useSelector(Selector.Video.videoList);
  const [order, setOrder] = React.useState<Order>('desc');
  const [orderBy, setOrderBy] = React.useState<keyof Job>('createdAt');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [jobToDelete, setJobToDelete] = React.useState<string>();

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Job,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const deleteJob = (jobId: string) => {
    dispatch(Command.Job.deleteJob({ id: jobId }));
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - jobs.length) : 0;

  const visibleRows = React.useMemo(
    () => [...jobs]
        .sort(getComparator(order, orderBy) as unknown as (a: Job, b: Job) => number)
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, jobs],
  );

  return (
    <Box component="div" sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer sx={{padding: "20px"}}>
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Masking Runs
        </Typography>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="runsTable"
            size={'medium'}
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={jobs.length}
            />
            <TableBody>
              {visibleRows.map((row) => {
                return (
                  <TableRow
                    hover
                    tabIndex={-1}
                    key={row.id}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Chip label={row.status} color={statusColors[row.status]} size="small" />
                    </TableCell>
                    <TableCell>
                      <MuiLink component={Link} to={Paths.makeVideoDetailsUrl(row.videoId)}>
                        {videos.find(video => video.id === row.videoId)?.name ?? row.videoId.slice(0, 8)}
                      </MuiLink>
                    </TableCell>
                    <TableCell>
                        {jobTypeLabels[row.type] ?? row.type}
                    </TableCell>
                    <TableCell>
                        <Tooltip title={row.createdAt.toLocaleString()}>
                            <span>{row.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </Tooltip>
                    </TableCell>
                    <TableCell sx={{ paddingTop: 1, paddingBottom: 1 }}>
                      <JobProgressCell job={row} />
                    </TableCell>
                    <TableCell>
                      <JobDurationCell job={row} />
                    </TableCell>
                    <TableCell>
                      <IconButton color={'primary'} size="small" onClick={() => setJobToDelete(row.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (53) * emptyRows,
                  }}
                >
                  <TableCell colSpan={7} />
                </TableRow>
              )}
              {jobs.length === 0 && (
                <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                            No masking runs yet. Start a run from the video detail page.
                        </Typography>
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={jobs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <DeleteJobDialog
        open={Boolean(jobToDelete)}
        onCancel={() => setJobToDelete(undefined)}
        onConfirm={() => {
          if (jobToDelete) {
            deleteJob(jobToDelete);
          }
          setJobToDelete(undefined)
        }}
      />
    </Box>
  );
}

export default RunsPage
