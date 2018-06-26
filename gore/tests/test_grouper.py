from gore.models import Event
from gore.utils.event_grouper import compute_group_hash


def test_address_cleaning():
    e1 = Event(
        type='error',
        message='<function foo.<locals>.get_result at 0x7f39d3caa620> failed',
        culprit='foo',
        level='fatal',
    )
    e2 = Event(
        type='error',
        message='<function foo.<locals>.get_result at 0x6e19d87f3c97> failed',
        culprit='foo',
        level='fatal',
    )
    assert compute_group_hash(e1) == compute_group_hash(e2)
