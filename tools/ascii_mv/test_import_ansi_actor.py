"""Standard ANSI cell fixtures; run with python -m unittest discover -s tools/ascii_mv -p test_import_ansi_actor.py."""
import unittest
from import_ansi_actor import decode_ansi


class HalfBlockAnsiTest(unittest.TestCase):
    def test_upper_and_lower_blocks_keep_independent_colors(self):
        im = decode_ansi('\x1b[38;2;255;0;0;48;2;0;0;255m▀▄\n')
        self.assertEqual(im.size, (2, 2))
        self.assertEqual(list(im.getdata()), [(255, 0, 0), (0, 0, 255),
                                              (0, 0, 255), (255, 0, 0)])

    def test_reset_full_block_and_background(self):
        im = decode_ansi('\x1b[38;2;4;5;6m█\x1b[0m▀ \r\n')
        self.assertEqual(list(im.getdata()), [(4, 5, 6), (255, 255, 255), (0, 0, 0),
                                              (4, 5, 6), (0, 0, 0), (0, 0, 0)])

    def test_non_rectangular_rows_rejected(self):
        with self.assertRaises(ValueError):
            decode_ansi('▀▀\n▀\n')

    def test_non_sgr_control_sequence_is_not_executed(self):
        with self.assertRaises(ValueError):
            decode_ansi('\x1b[2J▀')


if __name__ == '__main__':
    unittest.main()
