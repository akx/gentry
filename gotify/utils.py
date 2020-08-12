import re
from collections import Counter

from dateutil.relativedelta import relativedelta
from django.utils.timesince import timesince
from django.utils.timezone import now

unit_to_relativedelta_kwarg = {
    'm': 'minutes',
    'min': 'minutes',
    'sec': 'seconds',
    's': 'seconds',
    'h': 'hours',
    'hrs': 'hours',
    'd': 'days',
    'w': 'weeks',
    'mo': 'months',
}


def parse_relative_delta(s):
    kwargs = Counter()
    for atom in re.split(r'[,\s]+', s):
        atom_m = re.match(r'(\d+)\s*(.+)', atom)
        if not atom_m:
            raise ValueError('can not parse time atom %s' % atom_m)
        qty, unit = atom_m.groups()
        if unit not in unit_to_relativedelta_kwarg:
            raise KeyError('unknown unit %s' % unit)
        kwargs[unit_to_relativedelta_kwarg[unit]] += float(qty)

    return relativedelta(**kwargs)


def format_timestamp(timestamp):
    if timestamp.date() != now().date():
        return timestamp.strftime('%Y-%m-%d %H:%M:%S')
    return '%s ago (%s)' % (timesince(timestamp), timestamp.strftime('%H:%M:%S'))
