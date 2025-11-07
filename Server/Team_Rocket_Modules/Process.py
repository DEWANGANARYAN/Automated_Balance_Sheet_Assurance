import pandas as pd

class GLAnalyzer:
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        self.text = ""
        self.data = []
        self.ranges = []

    def _generate_ranges(self, step_size=10_000_000):
        max_gl = int(self.df['GL'].max())
        current = step_size
        while current <= max_gl:
            end = current + step_size - 1
            self.ranges.append((current, end))
            current += step_size

    def _analyze_ranges(self):
        fault = {}
        for start, end in self.ranges:
            temp = self.df[(self.df['GL'] >= start) & (self.df['GL'] <= end)]
            if temp.empty:
                self.text += f"Range {start}-{end} has no entries.\n"
                continue

            most_occured_name = temp['FS Grouping Main Head'].value_counts().idxmax()
            pos_count = temp[temp['Amount'] > 0].shape[0]
            neg_count = temp[temp['Amount'] < 0].shape[0]
            total = pos_count + neg_count

            if total == 0:
                continue

            percentage = (pos_count / total) * 100
            if percentage < 50:
                fault[start] = temp[temp['Amount'] > 0]['GL'].tolist()
                note = f"{most_occured_name} (ranges {start}-{end} should be negative). Positives: {pos_count} and list of fault is in GL {fault[start]}\n"
            else:
                fault[start] = temp[temp['Amount'] < 0]['GL'].tolist()
                note = f"{most_occured_name} (ranges {start}-{end} should be positive). Negatives: {neg_count} and list of fault is in GL {fault[start]}\n"

            self.text += note

    def _check_nulls(self):
        nullVal = int(self.df['Amount'].isna().sum())
        if nullVal:
            self.text += f"Null found in Amount: {nullVal}\n"
        else:
            self.text += "No Null Values found in Amount\n"

    def _compute_statistics(self):
        self.data = [
            float(self.df['Amount'].mean()),
            float(self.df['Amount'].median()),
            float(self.df['Amount'].std())
        ]
        self.text += f"Mean: {self.data[0]}, Median: {self.data[1]}, Standard Deviation:{self.data[2]}, Variance: {self.data[2]**2}\n"

    def _compute_z_scores(self):
        std = self.df['Amount'].std()
        self.df.loc[:, 'Z_score'] = (self.df['Amount'] - self.data[0]) / std
        critical_gls = self.df.loc[(self.df['Z_score'] > 3) | (self.df['Z_score'] < -3), ['GL', 'Z_score']].values.tolist()
        if not critical_gls:
            self.text += "Z Score of amount is in the range of -3 to 3"
        else:
            self.text += "Z score of amount is more than the critical range here is the list of GL : Z_score\n"
            for values in critical_gls:
                self.text += f'{int(values[0])}: {values[1]}\n'

    def run_analysis(self):
        total_gl = self.df['GL'].nunique()
        self.text += f'Total GL: {total_gl}\n'
        self._generate_ranges()
        self._analyze_ranges()
        self._check_nulls()
        self._compute_statistics()
        self._compute_z_scores()
        return self.text
