import re
from collections import Counter

from dateutil.relativedelta import relativedelta
from django.core.exceptions import ValidationError
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
            raise ValueError(f'can not parse time atom {atom_m}')
        qty, unit = atom_m.groups()
        if unit not in unit_to_relativedelta_kwarg:
            raise KeyError(f'unknown unit {unit}')
        kwargs[unit_to_relativedelta_kwarg[unit]] += float(qty)

    return relativedelta(**kwargs)


def format_timestamp(timestamp):
    if timestamp.date() != now().date():
        return timestamp.strftime('%Y-%m-%d %H:%M:%S')
    return f"{timesince(timestamp)} ago ({timestamp.strftime('%H:%M:%S')})"


def is_valid_regex(regex):
    try:
        re.compile(regex)
        return regex
    except re.error as err:
        raise ValidationError(f"Invalid regular expression: {err}")
